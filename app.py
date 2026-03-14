import os
import time
import torch
import cv2
import numpy as np
from flask import Flask, render_template, request, redirect, url_for, abort, Response
from werkzeug.utils import secure_filename
from PIL import Image
from torchvision import transforms as T
from model import CSRNet
from glob import glob

# ============================================================
# CONFIGURATION
# ============================================================

app = Flask(__name__)

UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
device = "cuda" if torch.cuda.is_available() else "cpu"

# ============================================================
# LOAD MODEL
# ============================================================

def load_model():
    print("[INFO] Looking for model weights...")
    possible_files = glob("*.pth") + glob("files/*.pth") + glob("saved_weights/*.pth")

    if not possible_files:
        raise FileNotFoundError("Could not find a .pth file! Please check your directory.")

    model_path = possible_files[0]
    print(f"[INFO] Loading model from: {model_path}")

    model = CSRNet(load_weights=True).to(device)
    model.load_state_dict(torch.load(model_path, map_location=device), strict=False)
    model.eval()

    print("[INFO] Model loaded successfully.")
    return model

model = load_model()

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def classify_density_level(count):
    if count < 150:
        return "Low"
    if count < 500:
        return "Medium"
    if count < 1500:
        return "High"
    return "Critical"


def estimate_confidence(raw_density):
    peak = float(raw_density.max())
    if peak <= 1e-8:
        return 40.0

    std = float(raw_density.std())
    active_ratio = float(np.mean(raw_density > (0.2 * peak)))

    stability = 1.0 - min(1.0, std / (peak + 1e-8))
    concentration = 1.0 - min(1.0, active_ratio * 1.6)
    score = (0.60 * stability) + (0.40 * concentration)
    return round(float(np.clip(score * 100.0, 40.0, 98.5)), 1)


def process_image(image_path):

    transform = T.Compose([
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225]),
    ])

    try:
        img = Image.open(image_path).convert("RGB")
    except Exception as e:
        print(f"[ERROR] Could not open image: {e}")
        return 0, None

    # Keep inference responsive by capping largest dimension.
    max_side = 1024
    width, height = img.size
    longest = max(width, height)
    if longest > max_side:
        scale = max_side / float(longest)
        new_size = (max(1, int(width * scale)), max(1, int(height * scale)))
        img = img.resize(new_size, Image.BILINEAR)

    img_tensor = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(img_tensor)
        count = int(output.detach().cpu().sum().numpy())

    raw_density = output.detach().cpu().numpy().squeeze()
    confidence = estimate_confidence(raw_density)
    density_level = classify_density_level(count)

    # Normalize
    norm_density = (raw_density - raw_density.min()) / (
        raw_density.max() - raw_density.min() + 1e-5
    )

    heatmap_uint8 = np.uint8(255 * norm_density)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

    img_np = np.array(img)
    heatmap_resized = cv2.resize(
        heatmap_colored,
        (img_np.shape[1], img_np.shape[0]),
        interpolation=cv2.INTER_LINEAR
    )

    img_np_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

    overlay = cv2.addWeighted(img_np_bgr, 0.5,
                              heatmap_resized, 0.5, 0)

    filename = os.path.basename(image_path)
    result_filename = f"result_{filename}"
    result_path = os.path.join(app.config['UPLOAD_FOLDER'], result_filename)

    cv2.imwrite(result_path, overlay)

    return count, result_filename, confidence, density_level


def build_insight(count, density_level):
    if density_level == "Critical":
        return "Critical density detected. Crowd-control intervention is recommended."
    if density_level == "High":
        return "High crowd density observed. Monitor flow and access points closely."
    if density_level == "Medium":
        return "Moderate density detected. Flow appears manageable with routine monitoring."
    return "Low density detected. No immediate crowd-risk pattern observed."


# ============================================================
# ROUTES FOR FRONTEND PAGES
# ============================================================

@app.route('/')
@app.route('/home')
@app.route('/home.html')
def home():
    return render_template('home.html')


@app.route('/scope')
@app.route('/scope.html')
def scope():
    return render_template('scope.html')


@app.route('/team')
@app.route('/team.html')
def team():
    return render_template('team.html')


@app.route('/about')
@app.route('/about.html')
def about():
    return render_template('about.html')


@app.route('/templates/<page>.html')
def templates_alias(page):
    allowed_pages = {'home', 'scope', 'team', 'about'}
    if page not in allowed_pages:
        abort(404)
    return render_template(f'{page}.html')


@app.route('/download-report')
def download_report():
    count = request.args.get('count', '').strip()
    confidence = request.args.get('confidence', '').strip()
    process_time_ms = request.args.get('process_time_ms', '').strip()
    density_level = request.args.get('density_level', '').strip()
    uploaded_image = request.args.get('uploaded_image', '').strip()
    result_image = request.args.get('result_image', '').strip()

    lines = [
        'Crowd Analysis Report',
        '=====================',
        f'Estimated Count: {count or "N/A"}',
        f'Confidence: {confidence + "%" if confidence else "N/A"}',
        f'Process Time: {process_time_ms + " ms" if process_time_ms else "N/A"}',
        f'Density Level: {density_level or "N/A"}',
        f'Uploaded Image: {uploaded_image or "N/A"}',
        f'Heatmap Result: {result_image or "N/A"}',
    ]
    content = '\n'.join(lines) + '\n'
    filename = 'crowd_analysis_report.txt'
    return Response(
        content,
        mimetype='text/plain',
        headers={'Content-Disposition': f'attachment; filename={filename}'}
    )


# ============================================================
# PREDICTION ROUTE (AI DEMO)
# ============================================================

@app.route('/predict', methods=['POST'])
def predict():

    file = request.files.get('file')
    if file is None and request.files:
        # Fallback for clients that send a different input field name.
        file = next(iter(request.files.values()))

    if file is None:
        return render_template('home.html', error_message='Please select a JPG or PNG image.')

    if file.filename == '':
        return render_template('home.html', error_message='No file selected. Please choose an image.')

    if file and allowed_file(file.filename):

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        started = time.perf_counter()
        count, result_filename, confidence, density_level = process_image(filepath)
        process_time_ms = int((time.perf_counter() - started) * 1000)
        if result_filename is None:
            return render_template('home.html', error_message='Image processing failed. Try another image.')

        return render_template(
            'home.html',
            uploaded_image=filename,
            result_image=result_filename,
            count=count,
            confidence=confidence,
            process_time_ms=process_time_ms,
            density_level=density_level,
            insight_message=build_insight(count, density_level),
            scrolled=True
        )

    return render_template('home.html', error_message='Unsupported file type. Please upload JPG or PNG.')


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":
    app.run(debug=True, port=5000)
