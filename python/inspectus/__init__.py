__version__ = '0.2.0'

from typing import List, Optional, TYPE_CHECKING, Union, Tuple, Dict

from inspectus.utils import get_color_list

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
              chart_types: Optional[List['str']] = None, color: Union[str, Dict[str, str]] = None, theme: str = "auto"):
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
    theme : str
        The theme to use for the visualization. Possible values are 'auto', 'light', and 'dark'. Default is 'auto'.

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
        dimensions=dimensions,
        theme=theme
    )


def compress_series(series, compress_steps=1):
    """
    Compresses a series to blocks of `compress_steps`

    Args:
        series: series as a list of dictionaries
        compress_steps: number of steps to compress

    Returns:

    """
    res = []
    for d in series:
        values = d['values']
        if not isinstance(values, list):
            values = [values]
        if not res or d['step'] - res[-1]['step'] >= compress_steps:
            res.append({'step': d['step'], 'values': [] + values})
        else:
            res[-1]['values'] += values

    return res


def series_to_distribution(series: Union[
    List[Dict],
    List['torch.Tensor'],
    List['np.ndarray'],
], steps: 'np.ndarray' = None):
    """
       Converts a series of data points into a distribution table.

       Parameters
       ----------
       series : Union[List[Dict], List['torch.Tensor'], List['np.ndarray']]
           A list of data points. Data points can be dictionaries, numpy arrays, or PyTorch tensors.
           Dictionary struture should be {'values': [data_points], 'step': step_value}.
       steps : np.ndarray, optional
           An array of step values. If not provided, step values are inferred from the data.

       Returns
       -------
       list
           A list of dictionaries representing the distribution table. Each dictionary contains the step, histogram, and mean of the data at that step.
       """
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


def distribution(data: Dict[str, Union[
    List[Dict],
    List['torch.Tensor'],
    List['np.ndarray'],
]], *,
                 include_mean: bool = True,
                 include_borders: bool = False,
                 levels=5,
                 alpha=0.5,
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
            Data points can be dictionaries(output from the inspectus.data_logger), numpy arrays, or PyTorch tensors.
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
    from inspectus.distribution_viz import render, _histogram_to_table

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
            table += _histogram_to_table(series, name)
        else:
            table += _histogram_to_table(series_to_distribution(series), name)
        i += 1

    return render(table,
                  levels=levels,
                  alpha=alpha,
                  include_borders=include_borders,
                  include_mean=include_mean,
                  color_scheme=color_scheme,
                  height=height,
                  width=width,
                  height_minimap=height_minimap)


ArrayLike = Union['torch.Tensor', 'np.ndarray', List[float]]


def tokens(tokens: List[str],
           values: Union[ArrayLike, Dict[str, ArrayLike]], *,
           token_info: Optional[list[str]] = None,
           remove_padding: bool = True,
           colors: Optional[Dict[str, str]] = None, theme: str = "auto"):
    """
    Visualize metrics related to tokens

    Parameters
    ----------
    tokens : list[str]
        List of tokens
    values : (ArrayLike or dict[str, ArrayLike])
        Values to visualize. (key: name, value: list of values with shape [num_tokens])
    token_info : Optional[list[str]]
        Aditional info about the tokens. Shape [num_tokens]
    remove_padding : bool
        Whether to remove padding in the visualization
    colors : Optional[Dict[str, str]]
        Colors to use for each metric in the visualization. 
        If not provided, it defaults to the default color scheme.
    theme : str
        The theme to use for the visualization. Possible values are 'auto', 'light', and 'dark'. Default is 'auto'.
    """

    if not isinstance(values, dict):
        values = {'value': values}
        
    if colors is None:
        colors = {}
    
    color_index = 0
    for name, _ in values.items():
        if name not in colors:
            colors[name] = get_color_list()[color_index % len(get_color_list())]
            color_index += 1

    for value_list in values.values():
        if len(value_list) != len(tokens):
            raise ValueError("All value lists must have the same length as the tokens list")

    if token_info is not None and len(token_info) != len(tokens):
        raise ValueError("token_info must have the same length as the tokens list")

    from inspectus.token_viz import visualize_tokens

    visualize_tokens(tokens, values,
                     token_info=token_info,
                     remove_padding=remove_padding, colors=colors, theme=theme)


__all__ = ['attention', 'series_to_distribution', 'distribution', 'tokens']
