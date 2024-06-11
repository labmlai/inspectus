import json
import pkgutil
from typing import List, NamedTuple, Dict, Union, Tuple

import numpy as np

from inspectus.utils import convert_b64

CHART_TYPES = ['attention_matrix', 'query_token_heatmap', 'key_token_heatmap', 'dimension_heatmap', 'token_dim_heatmap', 'line_grid']
DEFAULT_COLOR = 'blue'


def parse_colors(color: Union[str, Dict[str, str]]):
    if color is None:
        color = DEFAULT_COLOR

    color_json = {}
    for chart_type in CHART_TYPES:
        color_json[chart_type] = DEFAULT_COLOR

    if isinstance(color, str):
        for chart_type in CHART_TYPES:
            color_json[chart_type] = color
        return color_json

    if not isinstance(color, dict):
        raise ValueError(f'Unknown color type {type(color)}')

    for k, v in color.items():
        if k not in CHART_TYPES:
            raise ValueError(f'Unknown chart type {k}')
        color_json[k] = v

    return color_json



def _init_inline_viz():
    html = ''

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

    from IPython.display import display, HTML

    display(HTML(html))


class AttentionMap(NamedTuple):
    matrix: np.ndarray
    info: Dict[str, int]


def _extract_dimensions(attn_list: List[AttentionMap]):
    dimensions = set()
    for attn in attn_list:
        dimensions.update(attn.info.keys())

    return [{'name': dim_name} for dim_name in dimensions]


def _to_numpy_if_torch(tensor):
    try:
        import torch
    except ImportError:
        return tensor

    if isinstance(tensor, torch.Tensor):
        return tensor.detach().cpu().numpy()
    else:
        return tensor


def _parse_hf_attn(attn):
    if not isinstance(attn, (list, tuple)):
        return None

    try:
        import torch
    except ImportError:
        return None

    if not isinstance(attn[0], torch.Tensor):
        return None

    if len(attn[0].shape) != 4:
        raise ValueError(f'Expected attention output from transformers library.'
                         f'Each tensor should have shape [batch_size, heads, src, tgt].'
                         f'Got shape {attn[0].shape}')
    if attn[0].shape[0] != 1:
        raise ValueError(f'Expected attention output from transformers library. '
                         f'Each tensor should have shape [batch_size, heads, src, tgt]. '
                         f'And the batch size should be 1. '
                         f'Got shape {attn[0].shape}')
    attn = [[AttentionMap(a[0, head].detach().cpu().numpy(), {'layer': layer, 'head': head})
             for head in range(a.shape[1])]
            for layer, a in enumerate(attn)]
    return sum(attn, [])


def parse_attn(attn) -> Tuple[List[AttentionMap], List[Dict[str, str]]]:
    if isinstance(attn, tuple):
        attn = list(attn)

    if isinstance(attn, AttentionMap):
        return [attn], _extract_dimensions([attn])

    attn = _to_numpy_if_torch(attn)

    if isinstance(attn, np.ndarray):
        if len(attn.shape) < 2:
            raise ValueError('Attention should have at least 2 dimensions')
        elif len(attn.shape) == 2:
            return [AttentionMap(attn, {})], []
        elif len(attn.shape) == 3:
            return [AttentionMap(attn[i], {'layer': i}) for i in range(attn.shape[0])], [{'name': 'layer'}]
        elif len(attn.shape) == 4:
            attn = [[AttentionMap(attn[layer, head], {'layer': layer, 'head': head})
                     for head in range(attn.shape[1])]
                    for layer in range(attn.shape[0])]
            return sum(attn, []), [{'name': 'layer'}, {'name': 'head'}]
        else:
            raise ValueError(f'Unknown attention shape {attn.shape}')

    hf_attn = _parse_hf_attn(attn)
    if hf_attn is not None:
        return hf_attn, [{'name': 'layer'}, {'name': 'head'}]

    if isinstance(attn, list):
        if len(attn) == 0:
            raise ValueError('Attention should not be empty')
        if isinstance(attn[0], AttentionMap):
            for a in attn:
                if not isinstance(a, AttentionMap):
                    raise ValueError(f'Unknown attention map type: {type(a)}')
            return attn, _extract_dimensions(attn)

        raise ValueError(f'Unknown attention type {type(attn[0])}')

    return attn


def attention_chart(*,
                    attn: List[AttentionMap],
                    src_tokens: List['str'], tgt_tokens: List['str'], dimensions: List[Dict[str, str]],
                    chart_types: List['str'], color: Dict[str, str]):
    res = json.dumps({
        'attention': [{'values': convert_b64(a.matrix),
                       'info': a.info, 'shape': a.matrix.shape} for a in attn],
        'src_tokens': src_tokens,
        'tgt_tokens': tgt_tokens,
        'chart_types': chart_types,
        'dimensions': dimensions,
    })

    _init_inline_viz()

    from uuid import uuid1
    elem_id = 'id_' + uuid1().hex

    html = f'<div id="{elem_id}"></div>'

    script = f'<script>window.chartsEmbed(\'{elem_id}\',{res}, {color})</script>'

    from IPython.display import display, HTML

    display(HTML(html + script))
