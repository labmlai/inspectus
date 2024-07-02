import json
from json import JSONDecodeError
from pathlib import Path
from typing import Union, Dict, Any, List, TYPE_CHECKING
from inspectus.utils import to_json
from labml import monit, logger

if TYPE_CHECKING:
    import numpy as np
    import torch


class DataLogger:
    def __init__(self, path: Union[str, Path]):
        """
        Initializes the DataLogger object.

        Parameters
        ----------
        path : Union[str, Path]
            The path where the data will be logged.
        """
        if isinstance(path, str):
            path = Path(path)
        path = path.absolute()
        self._path = path

        if not path.exists():
            with monit.section(f'Create {path}'):
                path.mkdir(parents=True)
        elif not path.is_dir():
            raise ValueError(f'Path {path} is not a directory')
        else:
            with monit.section(f'Using {path}'):
                pass

    def clear(self):
        """
        Clears all the files in the directory specified in the path during the initialization of the DataLogger object.
        Raises a RuntimeError if a directory is found in the path.
        """
        for f in self._path.iterdir():
            if f.is_dir():
                raise RuntimeError(f'{f} is a folder')
            logger.log(f'Deleting {f}')
            f.unlink()

    def save(self, name: str, data: Union[
            Dict[str, Any],
            'np.ndarray',
            'torch.tensor'], step=-1):
        """
        Saves the data to a file in the directory specified in the path during the initialization of the
        DataLogger object.

        Parameters
        ----------
        name : str
            The name of the file where the data will be saved.
        data : Union[ Dict[str, Any], 'np.ndarray', 'torch.tensor']
            The data to be saved. This should be a dictionary, a numpy array or a pytorch tensor.
        step : int, optional
            The step at which the data is saved. Default is -1.
        """
        data = to_json(data)
        if 'step' not in data:
            data['step'] = step
        with open(self._path / f'{name}.jsonl', "a") as f:
            f.write(json.dumps(data) + '\n')

    def read(self, name: str) -> List[dict]:
        """
        Reads the data from a file in the directory specified in the path during the initialization of the
        DataLogger object.

        Parameters
        ----------
        name : str
            The name of the file from which the data will be read.

        Returns
        -------
        List[dict]
            A list of dictionaries containing the data read from the file.

        Raises
        ------
        RuntimeError
            If the file is not found or is not a valid jsonl file.
        """
        try:
            with open(self._path / f'{name}.jsonl', "r") as f:
                return [json.loads(line) for line in f]
        except FileNotFoundError:
            import glob
            files = glob.glob(str(self._path / f'{name}.*'))
            if files:
                raise RuntimeError(f'{name} is not a jsonl file')
            raise RuntimeError(f'{name} not found')
        except JSONDecodeError:
            raise RuntimeError(f'{name} is not a valid jsonl file')

    def get_names(self) -> List[str]:
        """
        Gets the names of all the files in the directory specified in the path during the initialization of the
        DataLogger object.

        Returns
        -------
        List[str]
            A list of strings containing the names of all the files in the directory.
        """
        return [p.stem for p in self._path.iterdir() if p.is_file()]

    def get_all(self) -> Dict[str, List[dict]]:
        """
        Gets all the data from all the files in the directory specified in the path during the initialization of the
        DataLogger object.

        Returns
        -------
        Dict[str, List[dict]]
            A dictionary where the keys are the names of the files and the values are lists of dictionaries
            containing the data from the corresponding files.
        """
        return {name: self.read(name) for name in self.get_names()}
