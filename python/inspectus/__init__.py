__version__ = '0.0.1'

from typing import List, Optional, TYPE_CHECKING, Union, Tuple, Dict

if TYPE_CHECKING:
    import numpy as np
    import torch


def attention(attn: Union[
    'np.ndarray',
    'torch.Tensor',
    List['torch.Tensor'],
    Tuple['torch.Tensor', ...],
],
              query_tokens: Optional[List['str']], key_tokens: Optional[List['str']] = None, *,
              chart_types: Optional[List['str']] = None, color: Union[str, Dict[str, str]] = None):
    """
    Use this to visualize attention maps.

    Parameters
    ----------
    attn : array-like
        `attn` should be a numpy array, a PyTorch tensor or an attention output from Huggingface transformers.
        For numpy arrays or PyTorch tensors, it should have the shape `[q_len, k_len]` or `[heads, q_len, k_len]`
        or `[layers, heads, q_len, k_len]`.
    query_tokens : (List[str], optional)
        This is the list of query tokens.
    key_tokens : (List[str], optional)
        This is the list of key tokens. If not provided it defaults to query tokens.
    chart_types : (List[str], optional)
        A list of chart types to render.
        If not provided, it defaults to
        `['attention_matrix', 'query_token_heatmap', 'key_token_heatmap', 'dimension_heatmap']`.
        Possible values are
        `'attention_matrix', 'query_token_heatmap', 'key_token_heatmap', 'dimension_heatmap', 'token_dim_heatmap', 'line_grid'`.
    color : (str, dict)
        A color to use for rendering components. Single color for all components or a dictionary of colors with
        (key: chart_type, value: color).
        If not provided, it defaults to 'blue'.
        refer https://observablehq.com/@d3/color-schemes for color options

    Raises
    ------
    ValueError
        If src_tokens is None or if attn is empty or if attn contains an unknown type or shape.
    """

    if query_tokens is None:
        raise ValueError('Tokens should be provided')

    if key_tokens is None:
        key_tokens = query_tokens

    from inspectus.attention import parse_attn, attention_chart, parse_colors

    attn, dimensions = parse_attn(attn)

    for a in attn:
        if a.matrix.shape != (len(query_tokens), len(key_tokens)):
            raise ValueError(f'Attention matrix size should be equal to '
                             f'[query_len, key_len] = [{len(query_tokens)}, {len(key_tokens)}]; got '
                             f'{list(a.matrix.shape)} instead.')

    if chart_types is None:
        chart_types = ['attention_matrix',
                       'query_token_heatmap',
                       'key_token_heatmap',
                       'dimension_heatmap']

    attention_chart(
        attn=attn,
        src_tokens=[str(t) for t in query_tokens],
        tgt_tokens=[str(t) for t in key_tokens],
        chart_types=chart_types,
        color=parse_colors(color),
        dimensions=dimensions
    )
