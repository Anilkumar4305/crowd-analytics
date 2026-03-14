import argparse
import os
import torch
import cv2
import numpy as np
import matplotlib.pyplot as plt
from torchvision import transforms as T
from PIL import Image
from model import CSRNet
import tkinter as tk
from tkinter import filedialog
from glob import glob

# Detect device
device = "cuda" if torch.cuda.is_available() else "cpu"

def select_file(title="Select File", filetypes=(("All files", "*.*"),)):
    """Opens a file dialog to let the user select a file."""
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    file_path = filedialog.askopenfilename(title=title, filetypes=filetypes)
    return file_path

def find_model_weights():
    """Attempts to auto-locate a .pth file in common directories."""
    # Look in current directory and 'files' subdirectory
    possible_files = glob("*.pth") + glob("files/*.pth") + glob("saved_weights/*.pth")
    
    if len(possible_files) > 0:
        # Return the first one found
        return possible_files[0]
    return None

def img_inference(image_path=None, output_dir="output", model_pth=None):
    # --- STEP 1: Auto-Detect or Ask for Model ---
    if not model_pth:
        # Try to find it automatically first
        detected_pth = find_model_weights()
        
        if detected_pth:
            model_pth = detected_pth
            print(f"[INFO] Auto-detected model weights: {model_pth}")
        else:
            # Only ask if we couldn't find it automatically
            print("Could not auto-detect model. Please select your .pth model file...")
            model_pth = select_file("Select your .pth Model File", (("Model files", "*.pth"), ("All files", "*.*")))
            
        if not model_pth:
            print("No model selected. Exiting.")
            return

    # --- STEP 2: Handle Missing Image Input ---
    if not image_path:
        print("Please select the Image you want to test...")
        image_path = select_file("Select an Image", (("Images", "*.jpg;*.jpeg;*.png"), ("All files", "*.*")))
        if not image_path:
            print("No image selected. Exiting.")
            return

    # --- STEP 3: Load Model ---
    print(f"[INFO] Loading model...")
    model = CSRNet(load_weights=True).to(device)
    try:
        model.load_state_dict(torch.load(model_pth, map_location=device), strict=False)
    except Exception as e:
        print(f"[ERROR] Could not load model weights: {e}")
        return
        
    model.eval()

    # --- STEP 4: Process Image ---
    print(f"[INFO] Processing image: {image_path}")
    os.makedirs(output_dir, exist_ok=True)

    transform = T.Compose([
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    try:
        img = Image.open(image_path).convert("RGB")
    except Exception as e:
        print(f"[ERROR] Could not open image: {e}")
        return

    img_tensor = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(img_tensor)
        count = int(output.detach().cpu().sum().numpy())
        print(f"------------------------------------------------")
        print(f"PREDICTED CROWD COUNT: {count}")
        print(f"------------------------------------------------")

    # --- STEP 5: Visualize and Save ---
    # Resize output density map to match original image size for better visualization
    temp = output.detach().cpu().numpy().squeeze()
    
    # Normalize density map for visualization
    temp = (temp - temp.min()) / (temp.max() - temp.min() + 1e-5)
    temp = np.uint8(255 * temp)
    temp = cv2.applyColorMap(temp, cv2.COLORMAP_JET)
    
    # Resize heatmap to match original image dimensions
    img_np = np.array(img)
    temp = cv2.resize(temp, (img_np.shape[1], img_np.shape[0]))
    
    # Overlay: 70% Original Image + 30% Heatmap
    overlay = cv2.addWeighted(img_np, 0.7, temp, 0.3, 0)

    # Save the result
    filename = os.path.basename(image_path)
    save_path = os.path.join(output_dir, f"result_{filename}")
    
    # Matplotlib saving (for consistency)
    fig, ax = plt.subplots()
    ax.imshow(overlay)
    ax.axis('off')
    ax.set_title(f'Predicted Count: {count}')
    fig.savefig(save_path, bbox_inches='tight', pad_inches=0)
    plt.close(fig)

    print(f"[SUCCESS] Output saved to: {save_path}")
    
    # Optional: Open the image immediately to show user
    try:
        os.startfile(save_path) # Windows only
    except:
        pass

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=str, default=None, help="Path to single image")
    parser.add_argument("--output_dir", type=str, default="output", help="Folder to save output")
    parser.add_argument("--model_pth", type=str, default=None, help="Path to .pth model file")
    args = parser.parse_args()

    img_inference(args.input, args.output_dir, args.model_pth)