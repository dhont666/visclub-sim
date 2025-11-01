#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test utilities for cross-platform compatibility
"""

import sys

# Configure UTF-8 for Windows
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        # Python < 3.7
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Safe symbols that work on all platforms
SYMBOL_SUCCESS = '[OK]'
SYMBOL_FAIL = '[FAIL]'
SYMBOL_WARNING = '[WARN]'
SYMBOL_INFO = '[INFO]'

def print_success(msg):
    """Print success message"""
    print(f"{SYMBOL_SUCCESS} {msg}")

def print_fail(msg):
    """Print failure message"""
    print(f"{SYMBOL_FAIL} {msg}")

def print_warning(msg):
    """Print warning message"""
    print(f"{SYMBOL_WARNING} {msg}")

def print_info(msg):
    """Print info message"""
    print(f"{SYMBOL_INFO} {msg}")
