import os
from glob import glob
from datetime import datetime

class LOGWRITER:

    def __init__(self, output_directory: str, total_epochs: int):
        self.output_dir = output_directory
        self.total_epochs = total_epochs
        log_files_count = len(glob(os.path.join(output_directory, "*.txt")))
        self.output_file_dir = os.path.join(self.output_dir, f"Log_{log_files_count}_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.txt")
        self._create_log_file()
    
    def _create_log_file(self):
        """Creates the log file upon object instantiation."""
        with open(self.output_file_dir, 'w') as writer:
            writer.write(f"Log file created on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            writer.flush()

    def log_results(self, epoch, **kwargs):
        """
        Logs the specified epoch's metrics and other key-value paired information to the log file.

        Args:
            epoch (int): The current epoch number during training.
            **kwargs: Arbitrary keyword arguments representing various metrics (like loss, accuracy, etc.) to log.
        """
        with open(self.output_file_dir, 'a') as writer:
            log = f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] [{epoch}/{self.total_epochs}] "
            for key, value in kwargs.items():
                log += f"| {key}: {round(value, 6)} | "
            
            writer.write(log + "\n")
            writer.flush()

    def write(self, str):
        """
        Write selected lines printed from terminal.
        """
        with open(self.output_file_dir, 'a') as writer:
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            writer.write(f"[{timestamp}] " + str + "\n")
            writer.flush()
        print(str)

    def log_error(self, error_message):
        """
        Logs an error message with a timestamp to the log file, useful for recording exceptions or problems encountered
        during training.

        Args:
            error_message (str): The error message to log.
        """
        with open(self.output_file_dir, 'a') as writer:
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            log = f"[{timestamp}] {error_message}\n"
            writer.write(log)
            writer.flush()
        print(error_message)
