[![Build Status](https://travis-ci.org/advanced-rest-client/cookie-manager.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/cookie-manager)  

# cookie-manager

`<cookie-manager>` A manager for session cookies. Displays a list of cookies that can be edited

The element queries the application for cookies to display by sending
`session-cookie-list-all` custom event. The handler should set a `result` property
on the details object and cancel the event.
Result is a promise that resolves to cookies array.

### Example

```
<cookie-manager on-session-cookie-list-all></cookie-manager>
<script>
document.body.querySelector('cookie-manager')
.addEventListener('session-cookie-list-all', function(e) {
  e.preventDefault();
  e.detail.result = Promise.resolve(cookies)
});
</script>
```

The element listens to `session-cookie-removed` and `session-cookie-changed`
events to update, add or delete a cookie from the list.
The `detail` object of this events is a cookie.

### Styling
`<cookie-manager>` provides the following custom properties and mixins for styling:

Custom property | Description | Default
----------------|-------------|----------
`--cookie-manager` | Mixin applied to the element | `{}`
`--cookie-manager-loader` | Mixin applied to the `paper-progress` element | `{}`
`--warning-primary-color` | Main color of the warning messages | `#FF7043`
`--warning-contrast-color` | Contrast color for the warning color | `#fff`
`--error-toast` | Mixin applied to the error toast | `{}`
`--empty-info` | Mixin applied to the label rendered when no data is available. | `{}`
`--cookie-manager-bottom-sheet` | Mixin applied to the bottom sheet tutorial element | `{}`



### Events
| Name | Description | Params |
| --- | --- | --- |
| session-cookie-list-all | Fired when queries the application for list of session cookies. The element expects the `result` property to be set on the `detail` object with a promise resolved to a list of cookies.  This event is cancelable. | __none__ |
| session-cookie-remove | Fired when cookies are to be deleted by the application.  The event is cancelable. | cookies **Array.<Object>** - A list of cookie objects. |
| session-cookie-udpate | Fired when the cookie should be updated by the application.  The event is cancelable. | cookie **Object** - A cookie object. |
