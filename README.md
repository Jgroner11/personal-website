# Jacob Groner Website

Personal website and display shelf for projects, CV details, and purpose writing.

Live at [jacobgroner.com](http://jacobgroner.com).

## Updating `llms.txt`

`llms.txt` is generated from the site content instead of edited by hand.

```bash
npm run update:llms
```

The generator reads the HTML pages, `projects.yaml`, and shared site data in `js/site.js`, then rewrites `llms.txt`.
