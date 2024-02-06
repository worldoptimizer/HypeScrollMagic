# HypeScrollMagic

## Overview

`HypeScrollMagic` is a JavaScript extension designed for integration with [Tumult Hype](https://tumult.com/hype/), enabling developers and designers to create interactive, scroll-based animations and interactions within their Hype projects. Leveraging the power of ScrollMagic, this extension makes it easy to trigger animations as users scroll through a webpage, enhancing the storytelling and user engagement of Hype animations.

## Features

- **Scroll-Driven Animations**: Trigger Hype timelines based on the scroll position, allowing for immersive storytelling and interactive experiences.
- **Dynamic Scene Control**: Automatically manages ScrollMagic scenes and controllers for each Hype scene, ensuring smooth transitions and optimal performance.
- **Symbol Support**: Works with both Hype main timelines and symbol timelines, offering flexibility in animation control.
- **Customizable Options**: Provides a variety of options for scene triggers, including offset, duration, and triggerHook, for precise control over animation timing.
- **Pin Elements**: Supports pinning elements during scroll, holding them fixed during a portion of the scroll sequence.
- **Integration with RulerHelper**: If using `HypeRulerHelper`, markers can be automatically added to visualize start and end points of scroll-driven animations.

## Installation

1. **Download the Script**
   - Clone this repository or download the `HypeScrollMagic.js` file directly.

2. **Include the Script in Your Hype Project**
   - Open your Tumult Hype project.
   - Navigate to the 'Resources' panel.
   - Click the '+' button and select 'Add File...' to include `HypeScrollMagic.js`.

3. **Initialization**
   - The script initializes automatically upon document load. No further action is required.

## Usage

`HypeScrollMagic` enhances Hype documents by allowing scroll position to control timeline animations. After including the script, scroll animations can be configured programmatically or through data attributes.

### Basic Usage
The extension looks for elements with the `data-scroll-timeline` attribute within each scene to automatically create scroll-driven animations. No manual initialization is needed for basic usage.

### Programmatically Adding Timelines
- **Add a Scroll Timeline**: `hypeDocument.addScrollTimeline(element, timelineName, options)` - Programmatically adds a scroll timeline to the specified element with custom options.

### Options
Customize each scroll timeline with options such as `pin`, `offset`, `duration`, `triggerHook`, and `reset`, allowing for fine-tuned control over the animation behavior.

### Advanced Integration
- **RulerHelper Markers**: When used with `HypeRulerHelper`, start and end markers for scroll animations can be automatically added, providing a visual guide during development.

## Compatibility

`HypeScrollMagic` is designed to work seamlessly with Tumult Hype and is compatible with most modern web browsers, ensuring a wide audience can experience the scroll-based animations.

## Contributing

Contributions to `HypeScrollMagic` are encouraged. Feel free to fork the repository, propose enhancements, or submit pull requests. For significant changes or new features, please open an issue first to discuss your ideas.

## License

`HypeScrollMagic` is released under the MIT license, consistent with the open-source spirit of sharing and collaboration in the development community.
