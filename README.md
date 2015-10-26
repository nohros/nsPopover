# nsPopover

``nsPopover`` is a simple component for angularjs applications that adds small overlays of content, like those on the
iPad, to any element for housing secondary information.. It has only angularjs as dependency.

### [Example] (http://nohros.com/nsPopover)

## Getting Involved
We use the Collective Code Construction Contract (http://rfc.zeromq.org/spec:22).
collaboration model.

## Install

You can download all necessary nsPopover files manually or install it with bower:

```bash
bower install nsPopover
npm install
grunt compile
```

## Usage

You need only to include the ``nsPopover.js`` (as minimal setup) to your project and then you can
start using the ``nsPopover`` directives.

### Directive

```javascript
angular
  .module('nsPopoverExample', [
   'nsPopover'
  ])

  .controller('MainCtrl', function($scope) {
    $scope.items = [{
      name: "Action"
    }, {
      name: "Another action"
    }, {
      name: "Something else here"
    }];
  });
```

``` html
<script type="text/ng-template" id="popover">
  <ul>
    <li ng-repeat="item in items"><a>{{item.name}}</a></li>
  </ul>
</script>

<button ns-popover
  ns-popover-template="popover"
  ns-popover-trigger="click"
  ns-popover-placement="bottom">
    Popover
</button>
```

### Attributes

``nsPopover`` defines a simple set of attributes that can be used to customize the popover behavior.

### `ns-popover {Boolean}`

The popover will show by default but ff you set `ns-popover` attribute equal to
a scope variable whose value is false, the popover will not be displayed. IE:

```
// In controller:
$scope.displayPopover = false;

// In HTML:
<div ns-popover="displayPopover"></div>
```

### ``ns-popover-template {String}``

The id of the template that contains the popover content. The content will be loaded through the
angular ``$http`` service and cached (content will not be loaded if it is already in ``$templateCache``). It
can be loaded through ``path`` to external html template or ``<script>`` tag with ``text\ng-template``.

```javascript
<script type="text/ng-template" id="templateId">
  <h1>Template heading</h1>
  <p>Some content</p>
</script>
```

Also it is possible to use simple strings as template together with ``ns-popover-plain`` option.

### ``ns-popover-plain {Boolean}``

A flag that indicates if the ``ns-popover-template`` is a plain string or not, default: ``false``.

### ``ns-popover-trigger {String}``

The ``ns-popover-trigger`` specify how the popover is triggered. This can be any event that the associated
DOM element can trigger, default: ``click``.

### ``ns-popover-timeout {Number}``

The ``ns-popover-timeout`` specify the time to wait before closing the popover and after the mouseout event is
triggered by the popover, default 1.5 seconds, use -1 to disable to timeout.

### ``ns-popover-placement {String}``

Specifies how to position the popover relative to the triggering element. The placement attribute has the given
syntax: [position]|[alignment]. The [position] parameter specifies the position (top/right/bottom/left) of
the popover, and the alignment defines the alignment of the popover (left/center/right). The list below shows
the possible combinations of [position] and [alignment].

Position | Alignment | Description
-------- |---------- | -----------
top | center | The popover will be positioned above the triggering element and its horizontal center will be aligned with the horizontal center of the triggering element.
top | left | The popover will be positioned above the triggering element and its left side will be aligned with the left side of the triggering element.
top | right | The popover will be positioned above the triggering element and its right side will be aligned with the right side of the triggering element.
bottom | center | The popover will be positioned on the below the triggering element and its horizontal center will be aligned with the horizontal center of the triggering element.
bottom | left | The popover will be positioned below the triggering element and its left side will be aligned with the left side of the triggering element.
bottom | right | The popover will be positioned below the triggering element and its right side will be aligned with the right side of the triggering element.
left | center | The popover will be positioned on the left side of the triggering element and its vertical center will be aligned with vertical center of the triggering element.
left | top | The popover will be positioned on the left side of the triggering element and its top will be aligned with the top of the triggering element.
left | bottom | The popover will be positioned on the left side of the triggering element and its bottom will be aligned with the bottom of the triggering element.
right | center | The popover will be positioned on the right side of the triggering element and its vertical center will be aligned with vertical center of the triggering element.
right | top | The popover will be positioned on the right side of the triggering element and its top will be aligned with the top of the triggering element.
right | bottom | The popover will be positioned on the right side of the triggering element and its bottom will be aligned with the bottom of the triggering element.

### `ns-popover-hide-on-inside-click {Boolean}`

The `ns-popover-hide-on-inside-click` attribute specifies whether or not to close the popover when clicking on it (or an element inside of it). Setting this to false allows for element-targeted closing of the popover (i.e. a close button _inside_ the popover). Defaults to `false`.

### ``ns-popover-mouse-relative {{String}}``

Locks the position relative to the mouse. The following are possible values:
 * x - Constraints the x axis to follow the mouse.
 * y - Constraints the y axis to follow the mouse.
 * xy - Constraints both the x and y axis to follow the mouse.

### ``ns-popover-group {String}``

The ``ns-popover-group`` specifies the group of popovers which should be closed when this instance is shown. This allows
the construction of popovers that acts like a modal dialog.

### Programmatic Hiding of the Popover

Register the ``hidePopover()`` function against a ``ng-click`` directive to hide the popover when a specific element is clicked (e.g. a close button):

```html
<button ng-click="hidePopover()">Close</button>
```

This button lives within the popover template.

### Themes

You can customize the ``nsPopover`` through themes. You can use the ``nsPopover`` to create your own theme, like so.

```scss
.ns-popover-custom-theme {
  ul, .list {
  }

  li, .list-item {
    list-style-type: none;

    a {
      &:hover {
      }
    }
  }
}
```

and them specify this theme on the HTML

```html
  <button ns-popover
    ns-popover-template="popover"
    ns-popover-theme="ns-popover-custom-theme">
      Popover
  </button>
```

## License

MIT Licensed

Copyright (c) 2013, nohros.com contact@nohros.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sub-license, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
