__version__ = '0.1.0'

from typing import List, Optional, TYPE_CHECKING, Union, Tuple, Dict

if TYPE_CHECKING:
    import numpy as np
    import torch

BASIS_POINTS = [
    0,
    6.68,
    15.87,
    30.85,
    50.00,
    69.15,
    84.13,
    93.32,
    100.00
]


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

    from inspectus.attention_viz import parse_attn, attention_chart, parse_colors

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


__all__ = ['attention']


def series_to_distribution(series: Union[
    List['dict'],
    List['torch.Tensor'],
    List['np.ndarray'],
], steps: 'np.ndarray' = None):
    import numpy as np
    table = []

    for i in range(len(series)):
        data = series[i]

        try:
            import torch
            if isinstance(data, torch.Tensor):
                data = data.detach().cpu().numpy()
        except ImportError:
            pass

        if isinstance(data, dict):
            dist = np.percentile(data['values'], BASIS_POINTS)
            mean = np.mean(data['values'])
            step = data['step']
        else:
            dist = np.percentile(data, BASIS_POINTS)
            mean = np.mean(data)
            step = steps[i] if steps is not None else i

        histogram = [dist[i] for i in range(0, 9)]
        row = {
            'step': step,
            'histogram': histogram,
            'mean': mean
        }
        table.append(row)

    return table


def distribution(data: dict[str, Union[
    List['dict'],
    List['torch.Tensor'],
    List['np.ndarray'],
]], *,
                 steps: Optional['np.ndarray'] = None,
                 include_mean: bool = True,
                 include_borders: bool = False,
                 levels=5,
                 alpha=0.6,
                 color_scheme='tableau10',
                 height: int = 500,
                 width: int = 700,
                 height_minimap: int = 100):
    """
        Generates a distribution visualization from the given data.

        Parameters
        ----------
        data : dict
            A dictionary where keys are series names and values are lists of data points.
            Data points can be dictionaries(output from the inspectus.daa_logger), numpy arrays, or PyTorch tensors.
        steps : np.ndarray, optional
            An array of step values. If not provided, step values are inferred from the data or generated from 1 to
            data point length.
        include_mean : bool, optional
            If True, includes the mean of the data in the visualization. Default is True.
        include_borders : bool, optional
            If True, includes borders at the highest and lowest levels in the visualization. Default is False.
        levels : int, optional
            An Integer between 1 and 5, the number of levels in the visualization. Default is 5.
        alpha : float, optional
            Opacity of the first band. Reduces by powers for each level. Default is 0.6.
        color_scheme : str, optional
            The color scheme to use for the visualization. Default is 'tableau10'.
        height : int, optional
            The height of the visualization. Default is 500.
        width : int, optional
            The width of the visualization. Default is 700.
        height_minimap : int, optional
            The height of the minimap in the visualization. Default is 100.

        Returns
        -------
        alt.Chart
            An Altair Chart object representing the distribution visualization.
        """
    from .distribution_viz import render, _histogram_to_table

    if levels > 5:
        levels = 5
    if levels < 1:
        levels = 1

    table = []
    i = 0
    for name, series in data.items():
        if len(series) == 0:
            continue

        if isinstance(series[0], dict) and 'histogram' in series[0]:
            table += _histogram_to_table(series, name, include_mean)
        else:
            table += _histogram_to_table(series_to_distribution(series), name, include_mean)
        i += 1

    return render(table,
                  levels=levels,
                  alpha=alpha,
                  include_borders=include_borders,
                  color_scheme=color_scheme,
                  height=height,
                  width=width,
                  height_minimap=height_minimap)
