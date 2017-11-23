# A custom view for GeoNetwork: 'Dutch Government Skin'

This project contains a skin for the GeoNetwork Opensource project at https://github.com/geonetwork. A skin generally consists of a number of overrides for templates (html), styles (less) and scripts (js). The skin can be added to a GeoNetwork core instance as a git submodule.

This work has been started by Kadaster Netherlands and is further maintained by the GeoNetwork Usergroup Netherlands. If you find any issues, use the github issue tracker here https://github.com/osgeonl/geonetwork-dutch-skin/issues.

The license of the project is GPLv2.

# Installation instructions

Initialise the skin as a git submodule in /web-ui/src/main/resources/catalog/views

`git submodule add https://github.com/osgeonl/geonetwork-dutch-skin.git web-ui/src/main/resources/catalog/views/dutch 3.4.x`
`git submodule init`

Verify the view by browsing to catalog.search?view=dutch
If ok, then alter the setting "view" to "dutch" in admin > settings

Some optional additional settings on the main project

- In pom.xml, configure the database type and connection details, Language.default, Language.forcedefault.

- In /WEB-INF/config/config-summary.xml, configure the facets to be displayed on the search results.

- In /catalog/js/gnLocale.js, reference the skin language override file /catalog/views/dutch/locales/nl-core.json

- Check https://github.com/metadata101/iso19139.nl.geografie.1.3.1 and https://github.com/metadata101/iso19139.nl.services.1.2.1 how to add dutch schema plugins

- On 'Admin > Settings' and 'Admin > Settings > User Interface' configure things such as catalog title, logo, url, map extent, etc

