import base64

import numpy


def convert_b64(data: numpy.ndarray) -> str:
    data = data.astype(numpy.float32)
    b64_str = base64.b64encode(data.flatten().tobytes()).decode('utf-8')

    return b64_str


def _to_json(data):
    try:
        import torch
        import torch.nn
        if isinstance(data, torch.nn.Parameter):
            data = data.data
        if isinstance(data, torch.Tensor):
            with torch.no_grad():
                data = data.cpu()
                if data.dtype == torch.bfloat16:
                    data = data.float()
                return data.numpy().tolist()
    except ImportError:
        pass
    if isinstance(data, (int, float)):
        return data
    if isinstance(data, numpy.ndarray):
        return data.tolist()
    elif isinstance(data, dict):
        return {k: _to_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [_to_json(v) for v in data]


def to_json(data):
    try:
        import torch
        if isinstance(data, torch.Tensor):
            with torch.no_grad():
                data = data.cpu()
                if data.dtype == torch.bfloat16:
                    data = data.float()
                return {'values': data.numpy().tolist()}
    except ImportError:
        pass
    if isinstance(data, (int, float)):
        return {'values': [data]}
    if isinstance(data, numpy.ndarray):
        return {'values': data.tolist()}
    elif isinstance(data, dict):
        return {k: _to_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return {'values': [_to_json(v) for v in data]}
