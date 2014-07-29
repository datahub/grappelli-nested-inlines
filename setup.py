#!/usr/bin/python
from setuptools import setup, find_packages


from grappelli_nested import __version__


github_url = 'https://github.com/datahub/grappelli-nested-inlines'
github_tag_version = '0.5.2'


setup(
    name='grappelli-nested-inlines',
    version='.'.join(str(v) for v in __version__),
    description='Enables nested inlines in the Django/Grappelli admin',
    url=github_url,
    download_url='%s/tarball/%s' % (github_url, github_tag_version),
    author='Allan James Vestal (based on code by Alain Trinh)',
    author_email='datahub@jrn.com',
    packages=find_packages(exclude=['tests']),
    include_package_data=True,
    license='MIT License',
    classifiers=[
        'Development Status :: 4 - Beta',
        'Environment :: Web Environment',
        'Framework :: Django',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Topic :: Software Development :: Libraries :: Python Modules'
    ],
    package_data={'grappelli_nested' : ['templates/admin/edit_inline/*.html',
                                      'static/admin/css/*.css',
                                      'static/grappelli/js/*.js']},
)
