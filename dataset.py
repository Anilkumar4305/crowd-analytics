import torchvision.transforms as T
from torch.utils.data import DataLoader, Dataset 
import os 
from glob import glob
from PIL import Image
from scipy import io
import h5py
import numpy as np
import cv2

class ShanghaiTech_CrowdCounting(Dataset):
    def __init__(self, root_dir, mode): 
        super().__init__() 

        self.image_dir = sorted(glob(os.path.join(root_dir, mode, "images/*.jpg")))
        self.ground_truth_dir = sorted(glob(os.path.join(root_dir, mode, "ground-truth/*.mat")))
        self.ground_truth_h5 = sorted(glob(os.path.join(root_dir, mode, "ground-truth-h5/*.h5")))

        self.transform = T.Compose([T.ToTensor(),
                                    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])])

    def __len__(self):
        return len(self.image_dir)

    def __getitem__(self, index): 
        img = self.transform(Image.open(self.image_dir[index]).convert("RGB"))
       
        pts = io.loadmat(self.ground_truth_dir[index])
        pts = len(pts['image_info'][0,0][0,0][0])

        with h5py.File(self.ground_truth_h5[index], 'r') as hf:
            gt = hf['density'][:]
        
        gt = np.array(gt)
        gt = cv2.resize(gt, (gt.shape[1] // 8, gt.shape[0] // 8), interpolation=cv2.INTER_LINEAR) * 64
        gt = T.ToTensor()(gt)

        return img, gt, pts
    
def get_dataset(root_dir : str, mode : str, batch_size : int):
    """
    Helper Function to instantiate dataset
    """
    dataset = ShanghaiTech_CrowdCounting(root_dir=root_dir, mode=mode)
    return DataLoader(dataset=dataset, batch_size=batch_size, shuffle=True)