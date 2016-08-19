# POM
POM Definition and basic Node library

 * To be used in WYSIWYM tools
   * [Skaryna](https://github.com/sielay/skaryna) editor
   * [Lackey](https://github.com/getlackey/lackey-cms) CMS
   
 * Influenced by
   * [Carbon](https://github.com/manshar/carbon) Editor model
   * [ProseMirror](https://github.com/prosemirror/prosemirror) Editor model
   
 * Constrains
   * Enforce clear copy structure, i.e. paragraphs can contain only inline formatting.
   * Documents can be nested
   * Allows components and extensions

## Basic Model Schema

Represent various HTML/Markdown artifacts

### Node

Extends `Object`

Field | Type   | Required | Description 
----- | ------ | -------- | -----------
type  | string | Y        | Define node type
name  | string | N        | ID applied by editor for more efficient referencing. Doesn't have to be saved to DB
attrs | object | N        | Object of key-value attributes

#### Naming Convention

 * `type` of lowercase represent semantic / html / markdown artifacts and core classes
 * `type` of Pascal-case represnet components

### Block Node

Extends [Node](#node)

Field | Type   | Required | Description 
----- | ------ | -------- | -----------
items | array  | Y        | Contains nedsted nodes

### Document

Extends [BlockNode](#blocknode)

Field | Value
----- | ------
type  | `document`

#### JSON Example

```javascript
{
  "type" : "document",
  "items" : [{
    "type" : "heading",
    "level" : 1,
    "text" : "Hello world"
  }, {
    "type" : "paragraph",
    "text" : "This is my lorem ipsum"
  }]
}
```

#### YAML Example

```yaml
type: document
items:
  -
    type: heading
    level: 1
    text: Hello world
  -
    type: paragraph
    text: This is my lorem ipsum
  
```

#### Markdown Example

```markdown
# Hello world

This is my lorem ipsum.
```

**!IMPORTANT!** As documents can be serialized to Markdown, they can be stored as it in both JSON and YAML formats. It's used often, when you have [Fields](#fields) component and store sub document (text area) as sub item.

### Quote

Extends [BlockNode](#blocknode)

Field | Value
----- | ------
type  | `quote`

### TextNode

Extends [Node](#node)

Field | Type   | Required | Description 
----- | ------ | -------- | -----------
text  | string | Y        | Contains text content
formats | array | N       | Contains format mappings

Field | Value
----- | ------
type  | `text`

#### JSON Example

```javascript
{
  "type" : "text",
  "text" : "This is my lorem ipsum"
  "formats" : [{
    "slice": [0,4],
    "apply": ["strong"]
  },{
    "slice": [11,5],
    "apply": [{
      "type": "A",
      "title": "Lorem ipsum"
      "href" : "http://www.lipsum.com/"
    }]
  }]
}
```

#### YAML Example

```yaml
type: paragraph
text: This is my lorem ipsum
formats:
  -
    slice: [0,4]
    apply: [strong]
  -
    splice: [11,5]
    apply:
      -
        type: A
        title: Lorem ipsum
        href: http://www.lipsum.com/

```

#### Markdown Example

```markdown
**This** is my [lorem ipsum](http://www.lipsum.com/ "Lorem ipsum").
```

### Format

Extends `Object`

Field | Type   | Required | Description 
----- | ------ | -------- | -----------
slice  | array of 2 integers | Y        | Contains slice begining and length
apply | array of strings | Y       | Contains list of formats to be applied

Allowed formats:

 * strong
 * em
 * small
 * code
 * abbr
 * cite
 * code 
 * a
 * sub
 * sup
 
 
Mapping of not allowed inline tags:

From | To 
---- | ----
b | strong
big | strong
i | em
tt | code
acronym | abbr
var | code
kbd | code

Mapping to be defined:


 * dfn
 * time
 * bdo
 * q
 * span
 * del
 * s 

### Link

Extends [Format](#format)

Field | Type   | Required | Description 
----- | ------ | -------- | -----------
href  | string | Y | Target of the link
title | string | N | Title of the link
target | string | N | Target window of the link

Field | Value
----- | ------
type  | `A`
 
### Paragraph

Extends [TextNode](#textnode)

Field | Value
----- | ------
type  | `paragraph`

### Image

Extends [Node](#node)

Field | Type   | Required | Description 
----- | ------ | -------- | -----------
src | string | Y | Image location
title | string | N | Image title
alt | string | N | Image alternative text

Field | Value
----- | ------
type  | `image`

### Heading

Extends [TextNode](#textnode)

Field | Type   | Required | Description 
----- | ------ | -------- | -----------
level | number from 1 to 6 | Y | Heading level

Field | Value
----- | ------
type  | `heading`

### StaticBlockNode

Extends [BlockNode](#blocknode)

## Components Model

Reflect more complex logic, mostly facilitated by Skaryna and Lackey.

### Fields

Extends [Node](#node)

Field | Type   | Required | Description 
----- | ------ | -------- | -----------
* (any other than `type` | mixed | N | Slot for key/value listed children

Field | Value
----- | ------
type  | `Fields`

### Variants

Extends [Node](#node)

Applies logic based on [besetmatch](https://github.com/sielay/bestmatch)

Field | Type   | Required | Description 
----- | ------ | -------- | -----------
* (any other than `type` | mixed | N | Slot for key/value listed children

Field | Value
----- | ------
type  | `Variants`

## Lackey components to be considered as part of the standard

 * List
 * Block
 * Media

## Lackey complex example

From [Lackey example site](https://github.com/getlackey/lackey-cms-site/blob/master/modules/core/config/content/pages.yml)

```YAML
type: Fields
title: Welcome to Lackey
subtitle: |
    **A new breed of** CMS
headerImage:
    type: Media
    source: img/core/lackey-site-design.png
blocks:
    type: List
    items:
        -
            type: Block
            template: ~/core/partials/block/signup-demo
            fields:
                title: Contact us for a **free** personal demo of the Lackey CMS
            props:
                namePlaceholder: Name
                emailPlaceholder: Email
                buttonLabel: Send me my link!

        -
            type: Block
            template: ~/core/partials/block/copy-media
            fields:
                title: For Content Admins
                subtitle: Easy to use and difficult to break.
                copy: |
                    Lackey facilitates the Client / Agency relationship, enforcing design rules and keeping admin users on a need to know basis. No dev stuff. It’s simple, focused &amp; consistent. Most CMS's let admins pick fonts, add hex ref colours, write HTML tags, and inject content in situations where it was never intended to go. Lackey gives admins just enough power and an easy life.
                image:
                    type: Media
                    source: img/core/lackey-cms-screenshot-1.png
            props:
                theme: white
                imageAlignment: side

        -
            type: Block
            template: ~/core/partials/block/copy-media
            fields:
                title: Power for Developers
                subtitle: Build better, faster.
                copy: |
                    The core technologies Lackey is built on are [Node.js](https://nodejs.org/) & [PostgreSQL](https://www.postgresql.org/). We use [npm](https://www.npmjs.com/) in favour of a plugin architecture and have the [core implemented as an npm module](https://github.com/getlackey/lackey-cms) and abstracted out from the instance (website or theme to those transitioning to us to escape Wordpress). We also provide an [open source example site](https://github.com/getlackey/lackey-cms-site) which will allow you to run/reuse the exact website you're reading now. Enjoy!
                image:
                    type: Media
                    source: img/core/lackey-cms-screenshot-2.png
            props:
                theme: white
                imageAlignment: side

        -
            type: Block
            template: ~/core/partials/block/copy-media
            fields:
                title: Freedom for Designers
                subtitle: Be creative. Not constrained.
                copy: |
                    Downloading $20 Wordpress themes and retrofitting the PSD with a font change brings shame on us all. Be original! Lackey layouts are limited only by your creativity. Structural Page Composition can be delegated to the client/admin who best knows how to tell their story; without giving them the means to compromise it's aesthetic. This new breed of CMS has been reimagined from the ground up as the perfect tool to collaborate on amazing, unique visual content.
                image:
                    type: Media
                    source: img/core/lackey-emblem.svg
            props:
                theme: blue
                imageAlignment: center

        -
            type: Block
            template: ~/core/partials/block/copy-cta
            fields:
                copy: The Lackey UI roadmap prototype is on InVision. Use your right arrow key!
                backgroundImage:
                    type: Media
                    source: img/core/lackey-ui-prototype.jpg
            props:
                href: https://invis.io/P383OLENF
                buttonLabel: Let's see it then
```

