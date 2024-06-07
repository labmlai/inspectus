import numpy
import base64


def convert_b64(data: numpy.ndarray) -> str:
    data = data.astype(numpy.float32)
    b64_str = base64.b64encode(data.flatten().tobytes()).decode('utf-8')

    return b64_str
