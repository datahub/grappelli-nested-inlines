#!/usr/bin/python
from setuptools import setup, find_packages

from grappelli_nested import __version__

github_url = 'https://github.com/datahub/grappelli-nested-inlines'
long_desc = open('README.md').read()

setup(
    name='grappelli-nested-inlines',
    version='.'.join(str(v) for v in __version__),
    description='Enables nested inlines in the Django/Grappelli admin',
    long_description=long_desc,
    url=github_url,
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
)
