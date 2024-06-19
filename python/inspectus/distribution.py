from typing import List, overload, Optional, Union
import altair as alt
import numpy as np
import torch
import os
import json

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


def render(table: dict, *,
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


def export_data(table: list[dict], path: str):
    series_dict = {}
    for row in table:
        if row['series'] not in series_dict:
            series_dict[row['series']] = [row]
        else:
            series_dict[row['series']].append(row)

    for series, data in series_dict.items():
        if not os.path.exists(path):
            os.makedirs(path)
        with open(f"{path}/{series}.json", "w") as f:
            for row in data:
                json.dump(row, f)
                f.write('\n')


def import_data(path: str):
    data = []
    for file in os.listdir(path):
        series = file.split('.')[0]
        with open(f"{path}/{file}", "r") as f:
            for line in f:
                data.append(json.loads(line))
    return data

"""
todo
- fix wastage
- auto detect levels
- save and load unprocessed data
"""

class Tracker:
    _path: str
    _type: str

    def __init__(self, path: str, type: str = 'histogram'):
        self._path = path
        self._type = type
        import os
        if not os.path.exists(self._path):
            os.makedirs(self._path)
        else:
            # clean the directory
            for file in os.listdir(self._path):
                os.remove(os.path.join(self._path, file))

    def write(self, entry: dict[str, any]):
        series = entry['series']
        with open(self._path + f'/{series}', "a") as f:
            json.dump(encode_entry(entry), f)
            f.write('\n')

    def read(self, series: str) -> List[dict]:
        with open(self._path + f'/{series}', "r") as f:
            return [decode_entry(json.loads(line), series) for line in f]


def encode_entry(entry: dict) -> dict:
    series = entry['series']
    entry.pop('series')
    step = entry['step']
    entry.pop('step')

    levels = (len(entry) - 1) // 2

    values = [entry[f"v{i}"] for i in range(5-levels, 5+levels+1)]

    return {'step': step, 'histogram': values}

def decode_entry(entry: dict, series: str) -> dict:
    step = entry['step']
    values = entry['histogram']

    levels = (len(values) - 1) // 2

    return {'series': series, 'step': step, **{f"v{5 - levels + i}": values[i] for i in range(levels*2+1)}}
