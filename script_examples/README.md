# WebPlotDigitizer UI Scripts

Here are a few examples of scripts that can be used from the user interface (File -> Run Scripts menu).

All exposed functions and objects are accessible via the `wpd` object in the global scope. Please use these cautiously, calling functions or modifying application objects via scripts may have unintended consequences such as data loss.

## Metadata

Axes, data sets, and data point can all hold metadata that are not populated via the WebPlotDigitizer UI. WebPlotDigitizer does not manage the metadata, but only exposes a getter and a setter.

#### API
**`Axes.prototype.getMetadata`**
> Retrieves metadata object stored on the axes.

**`Axes.prototype.setMetadata`**
> Stores given metadata object on the axes.

**`Dataset.prototype.getMetadata`**
> Retrieves metadata object stored on the data set.

**`Dataset.prototype.setMetadata`**
> Stores given metadata object on the data set.

**`Dataset.prototype.addPixel`**
> Takes an optional metadata object to store on the pixel (data point).

**`Dataset.prototype.insertPixel`**
> Takes an optional metadata object to store on the pixel (data point).

**`Dataset.prototype.setMetadataAt`**
> Stores given metadata object on the pixel at the given index.

#### Note
Data points (also known as pixels) require the metadata keys array updated in order to function properly. Use `Dataset.prototyp.getMetadataKeys` and `Dataset.prototyp.setMetadataKeys` to set the array. Bar axes point labels are stored as metadata on the data points and will always be the first element in the array if it exists. Likewise, data point value overrides on any axes are stored as metadata on the data points as well and will always be the last elements in the array if they exist. Be careful not to delete them when setting the metadata keys on the data set.

## Events

An event system is available to attach listeners to various actions taken in WebPlotDigitizer.

#### API

**`wpd.events.addListener`**
> Register a listener function to execute when the given event type fires.

- Parameters:
    - `String` - Event type
    - `Function` - Listener
- Return value:
    - `Function` - Wrapped function containing the given listener. Pass this to `wpd.events.removeListener` to remove the listener.

**`wpd.events.dispatch`**
> Fire a custom event.

- Parameters:
    - `String` - Event type
    - `Any` - [optional] Payload
- Return value:
    - `undefined`

**`wpd.events.getRegisteredEvents`**
> Get all registered events registered through `wpd.events.addListener`.

- Return value:
    - `Object` - Object containing all currently registered events. Keys are event types, values are arrays of wrapped listeners.

**`wpd.events.removeListener`**
> Remove a given listener.

- Parameters:
    - `String` - Event type
    - `Function` - Wrapped listener returned by `wpd.events.addListener`
- Return value:
    - `undefined`

**`wpd.events.removeAllListeners`**
> Remove all listeners of a given event type or all listeners.

- Parameters:
    - `String` - [optional] Event type
- Return value:
    - `undefined`

#### Built-in events types
**`wpd.axes.add`**
> Fires when a new axes has been added

- Payload:
    - `Object`
        - `axes`: `Axes` - Added axes

**`wpd.axes.delete`**
> Fires when an axes has been deleted

- Payload:
    - `Object`
        - `axes`: `Axes` - Delete axes

**`wpd.axes.select`**
> Fires when an existing axes has been selected

- Payload:
    - `Object`
        - `axes`: `Axes` - Selected axes

**`wpd.dataset.add`**
> Fires when a new data set has been added

- Payload:
    - `Object`
        - `dataset`: `Dataset` - Added data set

**`wpd.dataset.delete`**
> Fires when a data set has been deleted

- Payload:
    - `Object`
        - `dataset`: `Dataset` - Deleted data set

**`wpd.dataset.select`**
> Fires when an existing data set has been selected

- Payload:
    - `Object`
        - `dataset`: `Dataset` - Selected data set

**`wpd.dataset.point.add`**
> Fires when a new data point has been added

- Payload:
    - `Object`
        - `axes`: `Axes` - Axes added data point belongs to
        - `dataset`: `Dataset` - Data set added data point belongs to
        - `index`: `Number` - Index of added data point in data set (for use with `Dataset.prototype.getPixel`)

**`wpd.dataset.point.delete`**
> Fires when a data point has been deleted

- Payload:
    - `Object`
        - `axes`: `Axes` - Axes deleted data point belongs to
        - `dataset`: `Dataset` - Data set deleted data point belongs to
        - `index`: `Number` - Index of deleted data point in data set (for use with `Dataset.prototype.getPixel`)

**`wpd.dataset.point.select`**
> Fires when an existing data point has been selected

- Payload:
    - `Object`
        - `axes`: `Axes` - Axes selected data point belongs to
        - `dataset`: `Dataset` - Data set selected data point belongs to
        - `indexes`: `Array` - Array containing indexes of selected data points in data set (for use with `Dataset.prototype.getPixel`)

**`wpd.image.rotate`**
> Fires when the image has been rotated

- Payload:
    - `Object`
        - `rotation`: `Integer` - New rotation of image in degrees
