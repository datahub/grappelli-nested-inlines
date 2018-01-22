# django-nested-inlines

## Overview

Extends Alain Trinh ([http://github.com/Soaa-/](http://github.com/Soaa-/))'s django-nested-inlines code to work with the latest version of [Django Grappelli](http://github.com/sehmaschine/django-grappelli).

[Django issue #9025](http://code.djangoproject.com/ticket/9025)

Patches have been submitted, and repositories forked, but no one likes to use
either one. Now, nested inlines are available in an easy-to-install package.

### Issues

This is still beta-quality software, and certainly has its share of bugs. Use it in production sites at your own risk.

## Installation

`pip install grappelli-nested-inlines`

## Usage

`grappelli_nested.admin` contains three `ModelAdmin` subclasses to enable
nested inline support: `NestedModelAdmin`, `NestedStackedInline`, and
`NestedTabularInline`. To use them:

1. Add `grappelli_nested` to your `INSTALLED_APPS` **before** `grappelli` and
`django.contrib.admin`. This is because this app overrides certain admin
templates and media.
2. Run `./manage.py collectstatic` to get the new CSS and Javascript files that come with grappelli-nested-inlines.
3. Import `NestedModelAdmin`, `NestedStackedInline`, and `NestedTabularInline`
wherever you want to use nested inlines.
4. On admin classes that will contain nested inlines, use `NestedModelAdmin`
rather than the standard `ModelAdmin`.
5. On inline classes, use `Nested` versions instead of the standard ones.
6. Add an `inlines = [MyInline,]` attribute to your inlines and watch the
magic happen.

## Example

    from django.contrib import admin
    from grappelli_nested.admin import NestedModelAdmin, NestedStackedInline, NestedTabularInline
    from models import A, B, C

    class MyNestedInline(NestedTabularInline):
        model = C

    class MyInline(NestedStackedInline):
        model = B
        inlines = [MyNestedInline,]

    class MyAdmin(NestedModelAdmin):
        pass

    admin.site.register(A, MyAdmin)

### New features from Dietmap

##### 1. Added support for lazy formset initialization
 Example:


    class MyNestedInline(NestedTabularInline):
        model = C
        classes = ['grp-lazy']

    class MyInline(NestedStackedInline):
        model = B
        inline_classes = ['grp-collapse grp-open']
          
    class MyAdmin(NestedModelAdmin):
        inlines = [MyInline,]
    
Formset for MyNestedInline model admin will get initialized once it's parent form of MyInline is opened. This saves DOM processing time for large nested formsets.
 
 
##### 2. Added inline form events in DOM according to: https://docs.djangoproject.com/en/2.0/ref/contrib/admin/javascript/:
`formset:added`, `formset:removed` as well as new specific events: `formset:initialized` triggered when lazy formset has been initialized.



## Credits

As Trinh said himself, this package is mainly the work of other developers. I (Vestal) have merely adapted this package to support Django Grappelli (as Trinh says he's taken other developers' patches "and packaged them nicely for ease of use").

Besides Trinh, additional credit goes to:

- Gargamel for providing the base patch on the Django ticket.
- Stefan Klug for providing a fork with the patch applied, and for bugfixes.

See [Stefan Klug's repository](https://github.com/stefanklug/django/tree/nested-inline-support-1.5.x).
