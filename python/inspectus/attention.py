import json
from typing import List
import numpy as np
import pkgutil


def _init_inline_viz():
    html = ''

    js_file = pkgutil.get_data(__name__, "static/js/charts.js").decode('utf-8')
    html += f'<script type="text/javascript">{js_file}</script>'

    css_file = pkgutil.get_data(__name__, "static/css/charts.css").decode('utf-8')
    html += f'<style>{css_file}</style>'

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
    _init_inline_viz()

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

    display(HTML(html + script))
