import json
import pkgutil
from enum import Enum
from typing import List, NamedTuple, Dict

import numpy as np


class ChartType(Enum):
    AttentionMatrix = 'attention_matrix'
    TokenHeatmap = 'token_heatmap'
    DimensionHeatmap = 'dimension_heatmap'
    TokenDimHeatmap = 'token_dim_heatmap'
    LineGrid = 'line_grid'


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


def attention(attn: List[AttentionMap],
              src_tokens: List['str'] = None, tgt_tokens: List['str'] = None, *,
              chart_types: List['str'] = None):
    """
        This function visualizes the attention matrix of a transformer model in a Jupyter notebook.

        Parameters:
        attn_mat (np.ndarray): A 4D numpy array representing the attention matrix.
                               The dimensions are [layers, heads, n_src, n_tgt].
        src_tokens (List[str], optional): A list of source tokens. Defaults to a list of 'A' repeated n_src times.
        tgt_tokens (List[str], optional): A list of target tokens. Defaults to a list of 'T' repeated n_tgt times.

        Raises:
        AssertionError: If the length of src_tokens or tgt_tokens does not match n_src or n_tgt respectively.

        Returns:
        None
        """
    _init_inline_viz()

    html = ''

    from uuid import uuid1
    elem_id = 'id_' + uuid1().hex

    html += f'<div id="{elem_id}"></div>'

    if src_tokens is None:
        raise ValueError('Tokens should be provided')
    if tgt_tokens is None:
        tgt_tokens = src_tokens

    if isinstance(attn, tuple):
        attn = list(attn)

    if isinstance(attn, list):
        if not attn:
            raise ValueError('Attention should not be empty')
        if isinstance(attn[0], AttentionMap):
            for a in attn:
                if not isinstance(a, AttentionMap):
                    raise ValueError(f'Unknown attention map type: {type(a)}')
        else:
            import torch
            if isinstance(attn[0], torch.Tensor):
                # Huggingface attention
                if len(attn[0].shape) != 4:
                    raise ValueError(f'Exected attention output from transformers library.'
                                     f'Each tensor should have shape [batch_size, heads, src, tgt].'
                                     f'Got shape {attn[0].shape}')
                if attn[0].shape[0] != 1:
                    raise ValueError(f'Exected attention output from transformers library. '
                                     f'Each tensor should have shape [batch_size, heads, src, tgt]. '
                                     f'And the batch size should be 1. '
                                     f'Got shape {attn[0].shape}')
                attn = [[AttentionMap(a[0, head].detach().cpu().numpy(), {'layer': layer, 'head': head})
                         for head in range(a.shape[1])]
                        for layer, a in enumerate(attn)]
                attn = sum(attn, [])
            else:
                raise ValueError(f'Uknown attention type {type(attn[0])}')
    elif isinstance(attn, AttentionMap):
        attn = [attn]
    elif isinstance(attn, np.ndarray):
        if len(attn.shape) < 2:
            raise ValueError('Attention should have at least 2 dimensions')
        elif len(attn.shape) == 2:
            attn = [AttentionMap(attn, {})]
        elif len(attn.shape) == 3:
            attn = [AttentionMap(attn[i], {'layer': i}) for i in range(attn.shape[0])]
        elif len(attn.shape) == 4:
            attn = [[AttentionMap(attn[layer, head], {'layer': layer, 'head': head})
                     for head in range(attn.shape[1])]
                    for layer in range(attn.shape[0])]
            attn = sum(attn, [])
        else:
            raise ValueError(f'Unknown attention shape {attn.shape}')

    data = [{'values': a.matrix.tolist(),
             'info': a.info}
            for a in attn]

    if chart_types is None:
        chart_types = [ChartType.AttentionMatrix.value,
                       ChartType.TokenHeatmap.value,
                       ChartType.DimensionHeatmap.value]

    res = json.dumps({
        'attention': data,
        'src_tokens': src_tokens,
        'tgt_tokens': tgt_tokens,
        'chart_types': chart_types
    })

    script = ''
    script += '<script>'
    script += f"window.chartsEmbed('{elem_id}',{res})"
    script += '</script>'

    from IPython.display import display, HTML

    display(HTML(html + script))
