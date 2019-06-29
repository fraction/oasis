# Contributing

Hey, welcome! This project is still very experimental so I won't make any
promises about the future architechture, but today it's pretty simple:

```
src: you are here!
├── assets: static resources like CSS and images
└── routes: URL handlers that integrate views with models
    ├── models:	abstractions for working with the database
    │   └── lib:  code shared by models (like Markdown rendering)
    └── views: page renderers that receive data and output HTML
        └── components: shared components that are reused across pages
```

I'd really appreciate any issues or pull requests on GitHub. Please let me know
if there's anything I can do to help support your work on this project.

## Experiments

### Always forward, never back

I have a hunch that importing modules from parent directories makes it really
easy to create spaghetti code that's difficult to learn and maintain. I don't
know whether that's true, but I'm experimenting with a layer-based approach
where modules always `require('./some-layer/some-module')`. I don't know
whether this *actually* has any interesting properties, but I'm trying it out
to see whether it results in simpler software architechtures.

#### Pattern

```javascript
require('./foo/bar')
require('./lib/configurator')
require('./tools/quark-smasher')
```

#### Anti-pattern

```javascript
require('../../../great-grandparent-skyler')
require('./sibling-jamie')
require('./wat') // same as `require('./wat/index')
```

**Note:** I want to make *very* clear that this is an experiment, not a claim
that this is Objectively Better. It's also important to note that the essential
bit here is the [dependency graph][dep-graph], not the directory tree. I'm using
the directory tree as a proxy for the dependency graph because it's simple, but
the dependency graph of the following directory trees are identical:

```
├── a
└── b => c() + e()
    ├── c => d()
    │   └── d
    └── e => f()
        └── f
```

```
├── a
├── b => c() + e()
├── c => d()
├── d
├── e => f()
└── f
```


### Any my [hyper]axe

Converting JSON data to HTML templates is hard work. I started with Swig but
when I realized it wasn't maintained I rewrote everything in EJS. I liked it a
bit better than Swig, but JS-in-HTML still just felt clunky and wrong.

Most of my friends user HyperScript or nanohtml, but I wanted more structure.
Browsing the HyperScript readme I saw a reference to [hyperaxe][hyperaxe-gh],
which had all of the features I wanted to see:

- Compact JavaScript syntax, not HTML-in-JS (see: nanohtml)
- HTML tags as exported functions, not arbitrary strings (see: HyperScript)
- Meant to be used alone "bring your own HyperScript" (see: hyperscript-helpers)
- Uses HyperScript under the hood, which I've had lots of experience with
- Maintained by someone in my city (!) which is always a nice bonux
- Fun and friendly readme that's both light and super informative

The only bummer is that I can't find any other modules using it in production,
so I'm counting this as another experiment. It looks great and my first day with
it has been really enjoyable, but if something goes horribly wrong then we can
switch to hyperscript-helpers or something.

**Note:** I wasn't aware of hyperscript-helpers until I *after* I refactored
the templates to use hyperaxe. Oops. I think hyperaxe has a cooler name anyway.

[dep-graph]: https://en.wikipedia.org/wiki/Dependency_graph
[koa-blog]: https://github.com/koajs/examples/blob/1fd531698cc5ef21a61b627058ad0aafe9e55360/blog/lib/render.js#L13
[hyperaxe-gh]: https://github.com/ungoldman/hyperaxe
