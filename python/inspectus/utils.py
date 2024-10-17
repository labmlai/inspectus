import base64
import pkgutil
from typing import Dict, Callable
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
                data = data.clone().cpu()
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


def init_inline_viz():
    html = ''

    is_debug = False
    if is_debug:
        print("Debug Mode: Ignoring static folder for frontend static files")
        try:
            js_file = pkgutil.get_data('inspectus', "../../ui/build/js/charts.js").decode('utf-8')
            css_file = pkgutil.get_data('inspectus', "../../ui/build/css/charts.css").decode('utf-8')
        except FileNotFoundError:
            raise FileNotFoundError('Could not find the static files for the visualization in debug mode')
    else:
        try:
            js_file = pkgutil.get_data('inspectus', "static/js/charts.js").decode('utf-8')
            css_file = pkgutil.get_data('inspectus', "static/css/charts.css").decode('utf-8')
        except FileNotFoundError:
            try:
                js_file = pkgutil.get_data('inspectus', "../../ui/build/js/charts.js").decode('utf-8')
                css_file = pkgutil.get_data('inspectus', "../../ui/build/css/charts.css").decode('utf-8')
            except FileNotFoundError:
                raise FileNotFoundError('Could not find the static files for the visualization')

    html += f'<script type="text/javascript">{js_file}</script>'
    html += f'<style>{css_file}</style>'

    if is_ipynb_pycharm():
        print("\033[93mJetbrains IDE detected. Output might not be displayed properly. If any issue occurs please run in a jupyter notebook.\033[0m")

    from IPython.display import display, HTML

    display(HTML(html))


get_ipython: Callable


def is_ipynb():
    try:
        cfg = get_ipython().config
        if cfg['IPKernelApp'] is None:
            return False

        app: Dict = cfg['IPKernelApp']
        if len(app.keys()) > 0:
            return True
        else:
            return False
    except NameError:
        return False


def is_ipynb_pycharm():
    if not is_ipynb():
        return False

    if is_colab() or is_kaggle():
        return False

    import os
    if '_' not in os.environ:
        return True
    else:
        return False


def is_colab():
    import sys
    return 'google.colab' in sys.modules


def is_kaggle():
    import sys
    return 'kaggle_gcp' in sys.modules

def get_color_list():
    return ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]
