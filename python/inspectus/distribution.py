from typing import List, overload, Optional, Union
import altair as alt
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

@overload
def data_to_table(series: List[Union[np.ndarray, 'torch.Tensor']], *,
                 names: Optional[List[str]] = None,
                 levels: int = 5):
    ...


@overload
def data_to_table(series: List[Union[np.ndarray, 'torch.Tensor']],
                 step: np.ndarray, *,
                 names: Optional[List[str]] = None,
                 levels: int = 5):
    ...


@overload
def data_to_table(series: Union[np.ndarray, 'torch.Tensor'], *,
                 names: Optional[List[str]] = None,
                 levels: int = 5):
    ...


def data_to_table(*args: any,
                 names: Optional[List[str]] = None, levels=5):

    if levels > 5:
        levels = 5

    series = None
    step = None

    if len(args) != 0:
        if isinstance(args[0], list):
            series = args[0]
        else:
            series = [args[0]]

    if len(args) == 2:
        step = args[1]

    if names is None:
        digits = len(str(len(series)))
        names = [str(i + 1).zfill(digits) for i in range(len(series))]

    if series is None:
        raise ValueError("distribution should be called with a"
                         "a series. Check documentation for details.")

    table = []

    for s in range(len(series)):
        data = series[s]
        name = names[s]

        try:
            import torch
        except ImportError:
            torch = None

        if torch is not None and isinstance(data, torch.Tensor):
            data = data.detach().cpu().numpy()

        for i in range(data.shape[0]):
            if len(data.shape) == 2:
                if step is not None:
                    row = {'series': name, 'step': step[i]}
                else:
                    row = {'series': name, 'step': i}

                dist = np.percentile(data[i], BASIS_POINTS)
                row['v5'] = dist[4]
                for j in range(1, levels):
                    row[f"v{5 - j}"] = dist[4 - j]
                    row[f"v{5 + j}"] = dist[4 + j]
            else:
                row = {'series': name,
                       'v5': data[i]}

            if step is not None:
                row['step'] = step[i]
            table.append(row)

    return table


def _render_distribution(table: alt.Data, *,
                    x_name: str,
                    levels: int,
                    alpha: float,
                    color_scheme: str = 'tableau10',
                    series_selection=None,
                    selection=None,
                    x_scale: alt.Scale = alt.Undefined,
                    y_scale: alt.Scale = alt.Undefined) -> alt.Chart:
    areas: List[alt.Chart] = []
    for i in range(1, levels):
        y = f"v{5 - i}:Q"
        y2 = f"v{5 + i}:Q"

        encode = dict(
            x=alt.X('step:Q', scale=x_scale),
            y=alt.Y(y, scale=y_scale),
            y2=alt.Y2(y2),
            color=alt.Color('series:N', scale=alt.Scale(scheme=color_scheme))
        )

        if series_selection:
            encode['opacity'] = alt.condition(series_selection, alt.value(alpha ** i),
                                              alt.value(0.001))

        areas.append(
            alt.Chart(table)
            .mark_area(opacity=alpha ** i)
            .encode(**encode)
        )

    encode = dict(x=alt.X('step:Q', scale=x_scale, title=x_name),
                  y=alt.Y("v5:Q", scale=y_scale, title='Value'),
                  color=alt.Color('series:N', scale=alt.Scale(scheme=color_scheme)))

    if series_selection:
        encode['opacity'] = alt.condition(series_selection, alt.value(1), alt.value(0.001))

    line: alt.Chart = (
        alt.Chart(table)
        .mark_line()
        .encode(**encode)
    )
    if selection is not None:
        line = line.add_selection(selection)

    areas_sum = None
    for a in areas:
        if areas_sum is None:
            areas_sum = a
        else:
            areas_sum += a

    if areas_sum is not None:
        line = areas_sum + line

    if series_selection:
        line = line.add_selection(series_selection)

    return line


def render(table: alt.Data, *,
            levels=5,
            alpha=0.6,
            color_scheme='tableau10',
            height: int,
            width: int,
            height_minimap: int):

    zoom = alt.selection_interval(encodings=["x", "y"])
    selection = alt.selection_multi(fields=['series'], bind='legend')

    table = alt.Data(values=table)

    minimaps = _render_distribution(table,
                               x_name='',
                               levels=levels,
                               alpha=alpha,
                               selection=zoom,
                               color_scheme=color_scheme)

    details = _render_distribution(table,
                              x_name='Step',
                              levels=levels,
                              alpha=alpha,
                              color_scheme=color_scheme,
                              series_selection=selection,
                              x_scale=alt.Scale(domain=zoom.ref()),
                              y_scale=alt.Scale(domain=zoom.ref()))

    minimaps = minimaps.properties(width=width, height=height_minimap)
    details = details.properties(width=width, height=height)

    return details & minimaps
