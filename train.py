import torch 
import torch.nn as nn
import torch.optim as optim
from model import CSRNet
from dataset import *
from log_writer import LOGWRITER
import os
from tqdm import tqdm
import argparse
from typing import Union

device = "cuda" if torch.cuda.is_available() else "cpu"

def train_batch(model, optimizer, data, criterion): 
    model.train() 

    img, gt, pt = data 
    img, gt, pt = img.to(device), gt.to(device), pt.to(device)

    optimizer.zero_grad() 
    m_gt = model(img)
    loss = criterion(m_gt, gt)
    loss.backward() 
    optimizer.step() 

    pt_loss = nn.functional.l1_loss(m_gt.sum(), gt.sum())
    return loss.item(), pt_loss.item()

def validate_batch(model, data, criterion): 
    model.eval()

    img, gt, pt = data 
    img, gt, pt = img.to(device), gt.to(device), pt.to(device)

    m_gt = model(img)
    loss = criterion(m_gt, gt)
    pt_loss = nn.functional.l1_loss(m_gt.sum(), gt.sum())
    return loss.item(), pt_loss.item()

def CrowdCounting(root_dir : str, output_dir : str, total_epochs : int, model_pth : Union[str, None] = None): 
    logger = LOGWRITER(output_directory=output_dir, total_epochs=total_epochs)
    
    model = CSRNet().to(device)
    
    # Weights loading
    if model_pth:
        logger.write("[INFO] Model weights provided. Attempting to load model weights.")
        try:
            model.load_state_dict(torch.load(model_pth), strict=False)
            logger.log_error("[INFO] Model weights loaded successfully with strict=False.")
        except RuntimeError as e:
            logger.log_error(f"[WARNING] Runtime error occurred while loading some model weights: {e}")
        except FileNotFoundError as e:
            logger.log_error(f"[ERROR] File not found error occurred: {e}")
        except Exception as e:
            logger.log_error(f"[ERROR] An unexpected error occurred while loading model weights: {e}")
    else:
        logger.write("[INFO] No model weights path provided. Training from scratch.")

    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=1e-6)

    # Instantiates dataloaders
    trn_dl = get_dataset(root_dir=root_dir, mode="train_data", batch_size=1)
    val_dl = get_dataset(root_dir=root_dir, mode="test_data", batch_size=1)

    best_loss = float('inf')
    for epoch in range(total_epochs):
        
        # Training Loop
        total_tr_loss = 0.0 
        total_tr_pts_loss = 0.0
        for data in tqdm(trn_dl, desc=f"[{epoch+1}/{total_epochs}] Training: "):
            loss, pts_loss=train_batch(model, optimizer, data, criterion)
            total_tr_loss+=loss 
            total_tr_pts_loss+=pts_loss

        # Validation Loop
        total_val_loss = 0.0 
        total_val_pts_loss = 0.0
        with torch.no_grad():
            for data in tqdm(val_dl, desc=f"[{epoch+1}/{total_epochs}] Validating: "):
                loss, pts_loss = validate_batch(model, data, criterion)
                total_val_loss+=loss 
                total_val_pts_loss+=pts_loss

        # Validation Metrics calculation
        avg_tr_loss = total_tr_loss / len(trn_dl)
        avg_tr_pt_loss = total_tr_pts_loss / len(trn_dl)

        avg_val_loss = total_val_loss / len(val_dl)
        avg_val_pt_loss = total_val_pts_loss / len(val_dl)

        # Saving best model based on avg validation loss
        if avg_val_loss < best_loss:
            if not os.path.exists(os.path.join(output_dir, "saved_weights")): 
                os.mkdir(os.path.join(output_dir, "saved_weights"))
        
            best_loss = avg_val_loss
            save_path = os.path.join(os.path.join(output_dir, "saved_weights"), f'Best_model_{epoch+1}.pth')
            torch.save(model.state_dict(), save_path)

        if epoch == 10: optimizer = optim.Adam(model.parameters(), lr=1e-7)

        # Log results
        logger.log_results(epoch=epoch+1, 
                           tr_loss = avg_tr_loss, val_loss = avg_val_loss, 
                           tr_pt_loss = avg_tr_pt_loss, val_pt_loss = avg_val_pt_loss)
        
if __name__ == "__main__": 
    parser = argparse.ArgumentParser(description='Training CSRNet on Shanghai Crowd Counting Dataset')
    parser.add_argument("--root", type=str, required=True, help="root directory of dataset")
    parser.add_argument("--output_dir", type=str, required=True, help="output directory for saved weights and logs")
    parser.add_argument("--total_epoch", type=int, default=20, help="total epochs to train")
    parser.add_argument("--model_pth", type=str, help="model weights to load")

    args = parser.parse_args() 

    CrowdCounting(args.root, args.output_dir, args.total_epoch, args.model_pth)

