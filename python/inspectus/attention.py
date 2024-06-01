import json
import pkgutil
from typing import List, NamedTuple, Dict

import numpy as np


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


def parse_attn(attn) -> List[AttentionMap]:
    if isinstance(attn, tuple):
        attn = list(attn)

    if isinstance(attn, AttentionMap):
        return [attn]

    attn = _to_numpy_if_torch(attn)

    if isinstance(attn, np.ndarray):
        if len(attn.shape) < 2:
            raise ValueError('Attention should have at least 2 dimensions')
        elif len(attn.shape) == 2:
            return [AttentionMap(attn, {'layer': 0, 'head': 0})]
        elif len(attn.shape) == 3:
            return [AttentionMap(attn[i], {'layer': 0, 'head': i}) for i in range(attn.shape[0])]
        elif len(attn.shape) == 4:
            attn = [[AttentionMap(attn[layer, head], {'layer': layer, 'head': head})
                     for head in range(attn.shape[1])]
                    for layer in range(attn.shape[0])]
            return sum(attn, [])
        else:
            raise ValueError(f'Unknown attention shape {attn.shape}')

    hf_attn = _parse_hf_attn(attn)
    if hf_attn is not None:
        return hf_attn

    if isinstance(attn, list):
        if len(attn) == 0:
            raise ValueError('Attention should not be empty')
        if isinstance(attn[0], AttentionMap):
            for a in attn:
                if not isinstance(a, AttentionMap):
                    raise ValueError(f'Unknown attention map type: {type(a)}')
            return attn

        raise ValueError(f'Unknown attention type {type(attn[0])}')

    return attn


def attention_chart(*,
                    attn: List[AttentionMap],
                    src_tokens: List['str'], tgt_tokens: List['str'],
                    chart_types: List['str']):
    res = json.dumps({
        'attention': [{'values': a.matrix.tolist(),
                       'info': a.info} for a in attn],
        'src_tokens': src_tokens,
        'tgt_tokens': tgt_tokens,
        'chart_types': chart_types
    })

    _init_inline_viz()

    from uuid import uuid1
    elem_id = 'id_' + uuid1().hex

    html = f'<div id="{elem_id}"></div>'

    script = f'<script>window.chartsEmbed(\'{elem_id}\',{res})</script>'

    from IPython.display import display, HTML

    display(HTML(html + script))
