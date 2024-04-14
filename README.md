# HypeScrollMagic

## Overview

`HypeScrollMagic` is a JavaScript extension designed for integration with [Tumult Hype](https://tumult.com/hype/), enabling developers and designers to create interactive, scroll-based animations and interactions within their Hype projects. Leveraging the power of ScrollMagic, this extension makes it easy to trigger animations as users scroll through a webpage, enhancing the storytelling and user engagement of Hype animations.

Incorporating `HypeScrollMagic` into your Tumult Hype projects unlocks a new realm of interactive storytelling and user engagement through scroll-driven animations. By utilizing this powerful extension, you can create immersive web experiences that captivate your audience. Below are additional paragraphs detailing behaviors and an example for setting up event listeners for custom behaviors generated by the extension.

## Features

- **Scroll-Driven Animations**: Trigger Hype timelines based on the scroll position, allowing for immersive storytelling and interactive experiences.
- **Dynamic Scene Control**: Automatically manages ScrollMagic scenes and controllers for each Hype scene, ensuring smooth transitions and optimal performance.
- **Symbol Support**: Works with both Hype main timelines and symbol timelines, offering flexibility in animation control.
- **Customizable Options**: Provides a variety of options for scene triggers, including offset, duration, and triggerHook, for precise control over animation timing.
- **Pin Elements**: Supports pinning elements during scroll, holding them fixed during a portion of the scroll sequence.
- **Integration with RulerHelper**: If using `HypeRulerHelper`, markers can be automatically added to visualize start and end points of scroll-driven animations.
- **Integration with Hype Action Events**: When using `HypeActionEvents`, you can easily call functions by using data action attributes to bind scroll progress or events to actions (and Hype funtions).

## Quick Installation (via CDN)
For a quick start, it's possible to incorporate ScrollMagic and HypeScrollMagic directly into your project by adding the following scripts to the Head section of your HTML. This method bypasses the need to download dependencies manually:

<small>CDN Version</small>
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/ScrollMagic/2.0.8/ScrollMagic.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/worldoptimizer/HypeScrollMagic/HypeScrollMagic.min.js"></script>
```

To aid in debugging your scroll animations, you can utilize an optional debugging plugin alongside a visual ruler. These tools are immensely helpful during development for visual convenience and troubleshooting. However, it's advisable to remove them before deploying your project to a production environment to optimize performance and ensure a clean user experience.

<small>CDN Version (Including Debugging Tools)</small>
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/ScrollMagic/2.0.8/ScrollMagic.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/worldoptimizer/HypeScrollMagic/HypeScrollMagic.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/worldoptimizer/HypeRulerHelper/HypeRulerHelper.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/worldoptimizer/HypeScrollMagic/HypeScrollMagic.pluginDebug.min.js"></script>
```

## Usage

`HypeScrollMagic` enhances Hype documents by allowing scroll position to control timeline animations. After including the script, scroll animations can be configured programmatically or through data attributes.

### Basic Usage
The extension looks for elements with the `data-scroll-timeline` attribute within each scene to automatically create scroll-driven animations. No manual initialization is needed for basic usage.

## Data Attributes

`HypeScrollMagic` utilizes `data-attributes` in HTML elements to define and control scroll-driven animations. These attributes allow for a declarative approach to configuring animations, making it easy to integrate and manage animations directly within your HTML markup.

### Main Data-Attributes

- **`data-scroll-timeline`**: Links an HTML element to a specific Hype timeline or timelines. Specify one or multiple timeline names separated by commas to trigger upon scrolling. While `data-scroll-offset` and `data-scroll-duration` are essential attributes for defining the start point and length of the scroll animation respectively, if they are not explicitly declared, `HypeScrollMagic` will assume these values based on the element's bounding box dimensions. This ensures that animations are still triggered effectively based on the element's position and size within the webpage, even in the absence of specific `data-scroll-offset` and `data-scroll-duration` values.

### Basic Data Attributes

- **`data-scroll-pin`**: Pins the element in place for the duration of the scroll animation. No value is required; the presence of the attribute activates pinning.
- **`data-scroll-offset`**: Adjusts the start point of the animation relative to the trigger element, specified in pixels.
- **`data-scroll-duration`**: Defines the length over which the scroll animation plays, in pixels.
- **`data-scroll-trigger`**: Specifies the viewport position at which the animation should start, as a fraction of the viewport height.
- **`data-scroll-reset`**: If set to `false`, prevents the animation from resetting to its start state when scrolled back above the trigger point.
- **`data-scroll-horizontal`**: Changes the scroll direction that triggers the animation from vertical to horizontal.

### CSS Properties Attribute

- **`data-scroll-properties`**: This attribute dynamically links CSS variables to scroll activity, enabling styled effects based on scroll position. It specifies the names of the CSS variables that should be updated within the scope of the Hype document according to scroll progress, duration, and offset. If a specific value is provided for `data-scroll-properties`, such as `sample`, the corresponding CSS variables within the element's scope are named `--sample-progress`, `--sample-duration`, and `--sample-offset`. If no value is specified, the default variables `--scroll-progress`, `--scroll-duration`, and `--scroll-offset` are used. This functionality allows for sophisticated integration of CSS-driven animations and effects based on user interaction with scrollable content.

#### For example:

This example that uses the CSS properties defined through the `data-scroll-properties` as `sample` to dynamically adjust the letter-spacing of an element based on the scroll progress. The letter-spacing will increase as you scroll further:

```css
.dynamic-spacing {
  letter-spacing: calc(var(--sample-progress) * 5px);
}
```

In this example, the `letter-spacing` property of elements with the class `.dynamic-spacing` is adjusted based on the value of `--sample-progress`, which is set via the `data-scroll-properties` attribute on the corresponding HTML element. As `--sample-progress` increases (indicative of the user scrolling down the page), the letter-spacing of the text increases up to a maximum defined by the progress, multiplied by 5 pixels. This creates a dynamic effect where the spacing between characters expands as the user scrolls through the content.

### Indicator-Dependent Data Attributes (Requires Plugin Debug)

- **`data-indicator-color`**: Customizes the color of scroll animation indicators for development and debugging purposes.
- **`data-indicator-force`**: Forces the display of scroll animation indicators for specific elements, useful for debugging.

### Action-Dependent Data Attributes (Requires Hype Action Events)

#### Initialization Actions

- **`data-scroll-offset-action`**: This attribute specifies custom logic to dynamically calculate the initial offset for the scroll interaction. The action code should return a numeric value representing the offset position, modifying how the scroll starts relative to the trigger element.

- **`data-scroll-duration-action`**: Determines the duration of the scroll effect by executing a custom script provided in this attribute. The script should calculate and return the duration, allowing for dynamic adjustments based on content or user interactions.

- **`data-scroll-trigger-action`**: Executes a script to dynamically determine the triggerHook value at runtime. This value influences the point along the scroll where the animation or action should start, providing flexibility to adapt based on dynamic conditions.

#### Animation Actions

- **`data-scroll-progress-action`**: Specifies the action to trigger as the scroll animation progresses. This attribute should contain the code to be executed, facilitating dynamic interactions based on the scroll position. Requires Hype Action Events to be implemented.

- **`data-scroll-enter-action`**: Executes a custom script or action when the scroll enters the animation trigger area. This can be used for initialization effects or setting properties when the scroll animation starts. Requires Hype Action Events to be implemented.

- **`data-scroll-leave-action`**: Executes a custom script or action when the scroll leaves the animation trigger area. This allows for cleanup actions or effects that are triggered when the scroll animation ends or exits the trigger area. Requires Hype Action Events to be implemented.

### Scope and Event Object in Action Calls

When actions are triggered using Hype Action Events, specific scroll-related properties such as `offset`, `duration`, and `triggerHook` are exposed within the scope of the action. This allows for direct manipulation and calculation within the action scripts. For instance, expressions like `offset + duration / 2` can be used directly in `data-scroll-offset-action` or `data-scroll-duration-action` to compute values dynamically based on the current scrolling context.

In cases where a Hype function is invoked, such as `myOffset()`, Hype automatically populates the function's signature with `hypeDocument`, `element`, and `event`. The scope values (e.g., `duration`, `offset`) are also added to the event object, accessible as `event.duration`, `event.offset`, etc. This integration ensures that all relevant data is readily available within the function for precise control and customization of the scroll behavior.

## Behaviors

`HypeScrollMagic` introduces a suite of behaviors that can be leveraged to create dynamic and engaging web content. These behaviors are triggered based on the user's scroll actions, providing a seamless integration between the user's interaction and the animation response. By defining specific behaviors for scroll events, such as `enter`, and `leave`, you can craft intricate animation sequences that are perfectly synchronized with the scroll position. This level of control allows for the creation of narrative-driven or interactive content that responds intuitively to user input.

### Custom Behaviors and Event Listening

Custom behaviors are at the heart of `HypeScrollMagic`, offering a way to extend the interactivity of your Hype projects beyond predefined animations. When a scroll timeline reaches certain milestones, such as the start or end of an animation, `HypeScrollMagic` can automatically trigger custom behaviors named following a specific convention. These behaviors can then be listened for within Tumult Hype, enabling you to execute additional actions or animations in response.

For example, if you have a timeline named "exampleTimeline", the extension can generate custom behaviors like 
```exampleTimeline Enter Forward``` 
when the scroll enters the timeline boundary moving downwards, or 
```exampleTimeline Leave Reverse``` 
when scrolling out of the timeline boundary upwards. Listening to these custom behaviors within your Hype project allows for sophisticated control over the user experience, enabling actions such as triggering other timelines, changing element properties, or even integrating with external APIs in response to scroll events.



### Programmatically Adding Timelines
- **Add a Scroll Timeline**: `hypeDocument.addScrollTimeline(element, timelineName, options)` - Programmatically adds a scroll timeline to the specified element with custom options.

### Options
Customize each scroll timeline with options such as `pin`, `offset`, `duration`, `triggerHook`, and `reset`, allowing for fine-tuned control over the animation behavior.

### Advanced Usage Example

For those looking to dive deeper into the capabilities of `HypeScrollMagic`, here is an example demonstrating how to programmatically add a scroll timeline to an element and register an event handler to track the animation's progress:

```javascript
// Add a scroll timeline to an element with custom options
const myAnim = hypeDocument.addScrollTimeline(document.querySelector('.test'), 'exampleTimeline', {
  duration: '50%',
  pin: true,
});

// Register an event handler to track progress
myAnim.on('progress', function(event) {
  // Log progress for debugging purposes
  console.log((event.progress * 100).toFixed(2) + '%');
});
```

In this example, a scroll timeline is added to an element with the class `.test`, using the 'exampleTimeline' as the timeline name within Hype. The animation is set to last for 50% of the scroll distance and will pin the element in place while the timeline plays. An event listener is then registered to the `progress` event, allowing you to track the animation's progress and potentially trigger custom behaviors or other actions based on the scroll position.

By combining the power of `HypeScrollMagic` with Tumult Hype's robust animation and interactivity features, you can create unparalleled web experiences that engage, inform, and entertain your audience.


### Content Delivery Network (CDN)

To seamlessly integrate the latest version of `HypeScrollMagic` into your Hype project, include the following script tag in the head section of your HTML:

```html
<script src="https://cdn.jsdelivr.net/gh/worldoptimizer/HypeScrollMagic/HypeScrollMagic.min.js"></script>
```

For additional security and version control, you may opt to use a version with Subresource Integrity (SRI) or specify a particular release. Detailed instructions and options are available on the JsDelivr CDN page for `HypeScrollMagic`:

- CDN Details: [https://www.jsdelivr.com/package/gh/worldoptimizer/HypeScrollMagic](https://www.jsdelivr.com/package/gh/worldoptimizer/HypeScrollMagic)

Learn more about incorporating the latest extension versions into your Hype projects and how to consolidate multiple extensions into a single file:

- Extension Usage Guide: [https://github.com/worldoptimizer/HypeCookBook/wiki/Including-external-files-and-Hype-extensions](https://github.com/worldoptimizer/HypeCookBook/wiki/Including-external-files-and-Hype-extensions)


### Advanced Integration
- **RulerHelper Markers**: When used with `HypeRulerHelper`, start and end markers for scroll animations can be automatically added, providing a visual guide during development.

## Compatibility

`HypeScrollMagic` is designed to work seamlessly with Tumult Hype and is compatible with most modern web browsers, ensuring a wide audience can experience the scroll-based animations.

## Contributing

Contributions to `HypeScrollMagic` are encouraged. Feel free to fork the repository, propose enhancements, or submit pull requests. For significant changes or new features, please open an issue first to discuss your ideas.

## License

`HypeScrollMagic` is released under the MIT license, consistent with the open-source spirit of sharing and collaboration in the development community.
