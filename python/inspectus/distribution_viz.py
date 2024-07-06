from typing import List
import altair as alt


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
        row['mean'] = data[i]['mean']

        table.append(row)

    return table


def _render_distribution(table: alt.Data, *,
                         x_name: str,
                         levels: int,
                         alpha: float,
                         include_mean: bool,
                         include_borders: bool,
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

    if include_borders:
        encode_down = dict(x=alt.X('step:Q', scale=x_scale, title=x_name),
                           y=alt.Y(f"v{5 - levels + 1}:Q", scale=y_scale, title='Value'),
                           color=alt.Color('series:N', scale=alt.Scale(scheme=color_scheme)))
        encode_up = dict(x=alt.X('step:Q', scale=x_scale, title=x_name),
                         y=alt.Y(f"v{5 + levels - 1}:Q", scale=y_scale, title='Value'),
                         color=alt.Color('series:N', scale=alt.Scale(scheme=color_scheme)))

        line_up = (
            alt.Chart(table)
            .mark_line()
            .encode(**encode_up)
        )
        line_down = (
            alt.Chart(table)
            .mark_line()
            .encode(**encode_down)
        )
        line += line_up
        line += line_down

    if include_mean:
        encode_mean = dict(x=alt.X('step:Q', scale=x_scale, title=x_name),
                           y=alt.Y(f"mean:Q", scale=y_scale, title='Value'),
                           color=alt.Color('series:N', scale=alt.Scale(scheme=color_scheme)))
        line_mean = (
            alt.Chart(table)
            .mark_line(strokeDash=[1, 1], blend='darken', strokeWidth=2)
            .encode(**encode_mean)
        )

        line += line_mean

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

    if selection is not None:
        line = line.add_params(selection)

    return line


def render(data: any, *,
           levels=5,
           alpha=0.6,
           include_borders,
           include_mean,
           color_scheme='tableau10',
           height: int,
           width: int,
           height_minimap: int):
    zoom = alt.selection_interval(encodings=["x", "y"])
    selection = alt.selection_point(fields=['series'], bind='legend')

    table = alt.Data(values=data)

    minimaps = _render_distribution(table,
                                    x_name='',
                                    levels=levels,
                                    alpha=alpha,
                                    selection=zoom,
                                    include_borders=include_borders,
                                    include_mean=include_mean,
                                    color_scheme=color_scheme)

    details = _render_distribution(table,
                                   x_name='Step',
                                   levels=levels,
                                   alpha=alpha,
                                   include_borders=include_borders,
                                   include_mean=include_mean,
                                   color_scheme=color_scheme,
                                   series_selection=selection,
                                   x_scale=alt.Scale(domain={"param": zoom.name, "encoding": "x"}),
                                   y_scale=alt.Scale(domain={"param": zoom.name, "encoding": "y"}))

    minimaps = minimaps.properties(width=width, height=height_minimap)
    details = details.properties(width=width, height=height)

    return details & minimaps
