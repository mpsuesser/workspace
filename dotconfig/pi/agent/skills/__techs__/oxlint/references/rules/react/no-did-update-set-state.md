# react/no-did-update-set-state

## What it does

Disallow usage of `setState` in `componentDidUpdate`.

### Why is this bad?

Updating the state after a component update will trigger a second `render()` call and can lead to property/layout thrashing.

### Examples

Examples of **incorrect** code for this rule:

```jsx
var Hello = createReactClass({
  componentDidUpdate: function () {
    this.setState({
      name: this.props.name.toUpperCase(),
    });
  },
  render: function () {
    return <div>Hello {this.state.name}</div>;
  },
});
```

Examples of **correct** code for this rule:

```jsx
var Hello = createReactClass({
  componentDidUpdate: function () {
    this.props.onUpdate();
  },
  render: function () {
    return <div>Hello {this.props.name}</div>;
  },
});
```

```jsx
var Hello = createReactClass({
  componentDidUpdate: function () {
    this.onUpdate(function callback(newName) {
      this.setState({
        name: newName,
      });
    });
  },
  render: function () {
    return <div>Hello {this.props.name}</div>;
  },
});
```

## Configuration

This rule accepts one of the following string values:

### `"allowed"`

Forbids any call to `this.setState` in `componentDidUpdate`
outside of functions.

### `"disallow-in-func"`

The `disallow-in-func` mode makes this rule more strict by disallowing calls to
`this.setState` even within functions.

Examples of **incorrect** code for this rule with the `"disallow-in-func"` option:

```jsx
var Hello = createReactClass({
  componentDidUpdate: function () {
    this.setState({
      name: this.props.name.toUpperCase(),
    });
  },
  render: function () {
    return <div>Hello {this.state.name}</div>;
  },
});
```

```jsx
var Hello = createReactClass({
  componentDidUpdate: function () {
    this.onUpdate(function callback(newName) {
      this.setState({
        name: newName,
      });
    });
  },
  render: function () {
    return <div>Hello {this.state.name}</div>;
  },
});
```

## Version

This rule was added in v1.62.0.
