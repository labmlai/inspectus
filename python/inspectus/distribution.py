import json
import os
from typing import List, overload, Optional, Union, Dict

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


def series_to_histogram(series, steps: np.ndarray = None):
    table = []

    for i in range(len(series)):
        data = series[i]

        if isinstance(data, np.ndarray):
            dist = np.percentile(data, BASIS_POINTS)
            step = steps[i] if steps is not None else i
        else:
            dist = np.percentile(data['values'], BASIS_POINTS)
            step = data['step']

        histogram = [dist[i] for i in range(0, 9)]
        row = {
            'step': step,
            'histogram': histogram
        }
        table.append(row)

    return table


def _histogram_to_table(data: List[dict], name: str):
    table = []

    for i in range(len(data)):
        row = {'series': name}

        dist = data[i]['histogram']
        row['v5'] = dist[4]
        for j in range(1, 5):
            row[f"v{5 - j}"] = dist[4 - j]
            row[f"v{5 + j}"] = dist[4 + j]

        row['step'] = data[i]['step']
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
        line = line.add_params(selection)

    areas_sum = None
    for a in areas:
        if areas_sum is None:
            areas_sum = a
        else:
            areas_sum += a

    if areas_sum is not None:
        line = areas_sum + line

    if series_selection:
        line = line.add_params(series_selection)

    return line


def render(data: List[dict], names: List[str], *,
           steps: Optional[np.ndarray] = None,
           levels=5,
           alpha=0.6,
           color_scheme='tableau10',
           height: int,
           width: int,
           height_minimap: int):
    zoom = alt.selection_interval(encodings=["x", "y"])
    selection = alt.selection_point(fields=['series'], bind='legend')

    table = []
    i = 0
    for name, series in zip(names, data):
        if len(series) != 0 and isinstance(series[0], dict):
            if 'histogram' in series[0]:
                table += _histogram_to_table(series, name)
            else:
                table += _histogram_to_table(series_to_histogram(series), name)
        elif isinstance(series, np.ndarray):
            table += _histogram_to_table(series_to_histogram(series, steps), name)
        i += 1

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
                                   x_scale=alt.Scale(domain={"param": zoom.name, "encoding": "x"}),
                                   y_scale=alt.Scale(domain={"param": zoom.name, "encoding": "y"}))

    minimaps = minimaps.properties(width=width, height=height_minimap)
    details = details.properties(width=width, height=height)

    return details & minimaps

"""
todo
- fix wastage
- auto detect levels
- save and load unprocessed data
- merge data_to_table and render
"""