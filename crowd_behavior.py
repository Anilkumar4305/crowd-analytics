import argparse
import os
import cv2
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from torchvision import transforms
from PIL import Image
from model import CSRNet

def extract_and_process_frames(video_path, model, device, interval=1):
    cap = cv2.VideoCapture(video_path)
    frame_rate = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / frame_rate

    timestamps = []
    density_maps = []

    frame_idx = 0
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % int(frame_rate * interval) == 0:
            frame_time = frame_idx / frame_rate
            timestamp = frame_time / duration  # Normalize to video duration (0 to 1)
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(frame_rgb)
            image_tensor = transform(pil_image).unsqueeze(0).to(device)

            with torch.no_grad():
                density_map = model(image_tensor)
                density_maps.append(density_map.cpu().numpy().squeeze())
                timestamps.append(timestamp)

        frame_idx += 1

    cap.release()
    return np.array(density_maps), np.array(timestamps)

def analyze_and_visualize_density(density_maps, timestamps, output_path):
    # Create a DataFrame from the density maps and timestamps
    df = pd.DataFrame({'timestamp': timestamps, 'density': density_maps.sum(axis=(1, 2))})
    df.set_index('timestamp', inplace=True)

    # Calculate the average density
    average_density = df['density'].mean()

    # Plot crowd density trends
    plt.figure(figsize=(12, 6))
    plt.plot(df.index, df['density'], marker='o', label='Crowd Density')
    plt.axhline(y=average_density, color='r', linestyle='--', label=f'Average Density: {average_density:.2f}')
    plt.xlabel('Normalized Time (0 to 1)')
    plt.ylabel('Crowd Density')
    plt.title('Crowd Density Trends Over Video Duration')
    plt.legend()
    plt.savefig(os.path.join(output_path, 'crowd_density_trends.png'))
    plt.show()

def plot_time_lapse(density_maps, timestamps, save_path):
    fig, ax = plt.subplots()
    ims = []

    for i, (dm, ts) in enumerate(zip(density_maps, timestamps)):
        im = ax.imshow(dm, animated=True, cmap='viridis')
        if i == 0:
            ax.imshow(dm, cmap='viridis')
        ims.append([im])

    ani = animation.ArtistAnimation(fig, ims, interval=200, blit=True, repeat_delay=1000)
    ani.save(save_path, writer='pillow')
    plt.show()

def main(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = CSRNet().to(device)
    model.load_state_dict(torch.load(args.model_path))

    density_maps, timestamps = extract_and_process_frames(args.video_path, model, device, interval=args.interval)
    analyze_and_visualize_density(density_maps, timestamps, args.output_path)
    plot_time_lapse(density_maps, timestamps, save_path=os.path.join(args.output_path, 'crowd_density_time_lapse.gif'))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Temporal Analysis of Crowd Density with CSRNet')
    parser.add_argument('--video_path', type=str, required=True, help='Path to the input video file')
    parser.add_argument('--model_path', type=str, required=True, help='Path to the trained CSRNet model')
    parser.add_argument('--interval', type=int, default=1, help='Frame extraction interval in seconds')
    parser.add_argument('--output_path', type=str, default='output', help='Directory to save the outputs')

    args = parser.parse_args()

    if not os.path.exists(args.output_path):
        os.makedirs(args.output_path)

    main(args)
