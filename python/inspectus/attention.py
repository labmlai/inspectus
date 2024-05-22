import json
from typing import List
import numpy as np


JS_CSS_ADDED = False


def init_inline_viz():
    html = ''

    global JS_CSS_ADDED

    if not JS_CSS_ADDED:
        html += '''<script src="https://cdn.statically.io/gist/lakshith-403/6c40cc4e37d07676f421108d9d0109a6/raw/bf7eb154f409b91a0c9afdc66dfe2cf2e8283347/labml_attn_without_sample.js"></script>'''
        html += '''<link rel="stylesheet" href="https://cdn.statically.io/gist/lakshith-403/81b16b30a7f2c853a536f3d3975a7693/raw/aaee9494e96c5370b27821e114562d2d8e64ce39/labml_attn.css">'''
        JS_CSS_ADDED = True

    from IPython.display import display, HTML

    display(HTML(html))


def attention(attn_mat: np.ndarray, src_tokens: List['str'] = None, tgt_tokens: List['str'] = None):
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
    html = ''

    from uuid import uuid1
    elem_id = 'id_' + uuid1().hex

    html += f'<div id="{elem_id}"></div>'

    layers, heads, n_src, n_tgt = attn_mat.shape

    if src_tokens is None:
        src_tokens = ['A'] * n_src
    if tgt_tokens is None:
        tgt_tokens = ['T'] * n_tgt

    assert len(src_tokens) == n_src
    assert len(tgt_tokens) == n_tgt

    data = []
    for layer in range(layers):
        for head in range(heads):
            data.append({'values': attn_mat[layer, head].tolist(),
                         'info': {'layer': layer, 'head': head}})

    res = json.dumps({
        'attention': data,
        'src_tokens': src_tokens,
        'tgt_tokens': tgt_tokens,
    })

    script = ''
    script += '<script>'
    script += f"window.chartsEmbed('{elem_id}',{res})"
    script += '</script>'

    from IPython.display import display, HTML

    display(HTML(html))
    display(HTML(script))
