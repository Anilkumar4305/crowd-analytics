# Crowd Analytics

Crowd Analytics is a crowd counting and behavior analysis web app built with PyTorch and a Flask frontend.

## Features
- Crowd counting from images
- Simple web UI for uploads and results
- Pretrained CSRNet model support

## Tech Stack
- Python
- PyTorch
- Flask
- HTML/CSS/JS

## Project Structure
- `app.py` - Flask app entry point
- `model.py` - CSRNet model definition
- `img_inference.py` - Inference utilities
- `train.py` - Training script
- `templates/` - HTML templates
- `static/` - Frontend assets
- `files/` - Model weights and sample inputs

## Setup
1. Create and activate a virtual environment
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

3. Download/ensure model weights
   - Place CSRNet weights at `files/CSRNet_Modified.pth`

## Run
```bash
python app.py
```
Then open your browser at `http://127.0.0.1:5000`.

## Demo
[Demo Video](https://drive.google.com/file/d/1g4GiBJr0MhA6T98b72mfFJCuV2e8DQ-P/view?usp=sharing)

## Notes
- `static/uploads/` is generated at runtime and is ignored by Git.
- Large files (`*.pth`, `*.mp4`) are tracked with Git LFS.

## License
MIT License. See `LICENSE`.

## Contributors
- Anil Kumar
- Mounika
- Abhi Ram
- Manish
