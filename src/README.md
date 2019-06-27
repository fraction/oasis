# src

Hey, welcome! This project is still very experimental so I won't make any
promises about the future architechture, but today it's pretty simple:

```
src: you are here!
├── assets: CSS, maybe images in the future?
└── routes: handlers for different URLs
    ├── models:	friendly database interfaces
    │   └── lib: code shared by models (like Markdown rendering)
    └── views: interface between routes and templates (TODO: remove)
        └── templates: HTML templates written in EJS
            └── layout: header and footer templates used by most templates
```

One of my current goals is to avoid importing modules from parent directories.
For example, I'd like to `require('./foo/bar')` instead of `require('../bar')`.
I don't know whether this *actually* has any interesting properties, but I have
a hunch that it might result in simpler software architechtures.
