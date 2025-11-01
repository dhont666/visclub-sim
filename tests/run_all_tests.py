#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test runner for Visclub SiM website
Runs all test suites and generates a summary report
"""

import subprocess
import sys
import os
import time
from datetime import datetime

# Enable UTF-8 output on Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# ANSI color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
BOLD = '\033[1m'
RESET = '\033[0m'

def print_header(text):
    """Print a formatted header"""
    print(f"\n{BLUE}{BOLD}{'='*60}{RESET}")
    print(f"{BLUE}{BOLD}{text.center(60)}{RESET}")
    print(f"{BLUE}{BOLD}{'='*60}{RESET}\n")

def print_success(text):
    """Print success message"""
    print(f"{GREEN}✓ {text}{RESET}")

def print_error(text):
    """Print error message"""
    print(f"{RED}✗ {text}{RESET}")

def print_warning(text):
    """Print warning message"""
    print(f"{YELLOW}⚠ {text}{RESET}")

def run_test(test_file, description):
    """Run a single test file and return success status"""
    print(f"\n{BOLD}Running: {description}{RESET}")
    print(f"Test file: {test_file}")
    print("-" * 60)

    try:
        result = subprocess.run(
            [sys.executable, test_file],
            capture_output=False,
            text=True,
            timeout=60
        )

        if result.returncode == 0:
            print_success(f"{description} PASSED")
            return True
        else:
            print_error(f"{description} FAILED (exit code: {result.returncode})")
            return False

    except subprocess.TimeoutExpired:
        print_error(f"{description} TIMED OUT")
        return False
    except Exception as e:
        print_error(f"{description} ERROR: {str(e)}")
        return False

def main():
    """Main test runner"""
    print_header("Visclub SiM Test Suite")

    # Get test directory
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # Define tests to run
    tests = [
        ('test_homepage.py', 'Homepage & Navigation Tests'),
        ('test_calendar.py', 'Calendar Page Tests'),
        ('test_registration.py', 'Registration Form Tests'),
        ('test_admin_with_server.py', 'Admin Panel Tests'),
    ]

    # Check if test files exist
    print(f"{BOLD}Checking test files...{RESET}")
    available_tests = []
    for test_file, description in tests:
        test_path = os.path.join(current_dir, test_file)
        if os.path.exists(test_path):
            print_success(f"Found: {test_file}")
            available_tests.append((test_path, description))
        else:
            print_warning(f"Not found: {test_file}")

    if not available_tests:
        print_error("No test files found!")
        return 1

    # Run tests
    print_header(f"Running {len(available_tests)} Test Suite(s)")

    start_time = time.time()
    results = []

    for test_path, description in available_tests:
        success = run_test(test_path, description)
        results.append((description, success))

    end_time = time.time()
    duration = end_time - start_time

    # Generate summary report
    print_header("Test Summary")

    passed = sum(1 for _, success in results if success)
    failed = len(results) - passed

    print(f"{BOLD}Total Tests:{RESET} {len(results)}")
    print_success(f"Passed: {passed}")
    if failed > 0:
        print_error(f"Failed: {failed}")
    else:
        print(f"{GREEN}Failed: 0{RESET}")

    print(f"\n{BOLD}Duration:{RESET} {duration:.2f} seconds")

    # Detailed results
    print(f"\n{BOLD}Detailed Results:{RESET}")
    for description, success in results:
        if success:
            print_success(description)
        else:
            print_error(description)

    # Screenshots location
    screenshots_dir = os.path.join(os.path.dirname(current_dir), 'tests', 'screenshots')
    if os.path.exists(screenshots_dir):
        screenshot_count = len([f for f in os.listdir(screenshots_dir) if f.endswith('.png')])
        print(f"\n{BOLD}Screenshots:{RESET} {screenshot_count} saved in tests/screenshots/")

    # Final status
    print_header("Final Status")
    if failed == 0:
        print(f"{GREEN}{BOLD}ALL TESTS PASSED! ✓{RESET}")
        return 0
    else:
        print(f"{RED}{BOLD}SOME TESTS FAILED! ✗{RESET}")
        return 1


if __name__ == '__main__':
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print(f"\n\n{YELLOW}Tests interrupted by user{RESET}")
        sys.exit(130)
    except Exception as e:
        print(f"\n{RED}Fatal error: {str(e)}{RESET}")
        sys.exit(1)
