import numpy
import base64


def convert_b64(data: numpy.ndarray) -> str:
    data = data.astype(numpy.float32)
    b64_str = base64.b64encode(data.flatten().tobytes()).decode('utf-8')

    return b64_str


def to_json(data):
    try:
        import torch
        if isinstance(data, torch.Tensor):
            return {'values': data.detach().cpu().numpy().tolist()}
    except ImportError:
        pass
    if isinstance(data, (int, float)):
        return {'values': [data]}
    if isinstance(data, numpy.ndarray):
        return {'values': data.tolist()}
    elif isinstance(data, dict):
        return data
    elif isinstance(data, list):
        return {'values': data}
