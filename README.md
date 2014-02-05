# nsPopover

``nsPopover`` is a simple component for angularjs applications that adds small overlays of content, like those on the
iPad, to any element for housing secondary information.. It has only angularjs as dependency.

### [Example] (http://nohros.com/nsPopover)

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

### ``ns-popover-template {String}``

The id of the template that contains the popover content. The content will be loaded through the
angular ``$http`` service and cached (content will not be loaded if it is already in ``$templateCache``). It
can be loaded through ``path`` to external html template or ``<script>`` tag with ``text\ng-template``.

```javascript
<script type="text\ng-template" id="templateId">
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

### ``ns-popover-placement {String}``

Specifies how to position the popover relative to the triggering element - top | bottom | left | right.

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
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.