#!/usr/bin/python3

import os
import time
import subprocess
import sys

def get_last_directory_modification(directory_path):
    latest_modification = 0
    for directory_path, _, files in os.walk(directory_path):
        for file in files:
            file_name = os.path.join(directory_path, file)
            try:
                stats = os.stat(file_name)
                if latest_modification < stats.st_mtime:
                    latest_modification = stats.st_mtime
            except:
                pass
    return latest_modification

def directory_changed():
    directory = os.getcwd()
    prevModTime = get_last_directory_modification(directory)
    while True:
        currentModTime = get_last_directory_modification(directory)
        if get_last_directory_modification(directory) >  prevModTime:
            prevModTime = currentModTime
            return True
        time.sleep(2)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: ./run_program.py <prog> <args...>")
        sys.exit(1)
    prog = sys.argv[1:]

    while True:
        process = subprocess.Popen(prog, text=True)
        print("--- new process ---")
        while True:
            if directory_changed():
                os.system(f"kill $(netstat -lpdn | grep 3000 | tr -s ' ' | cut -d' ' -f7 | cut -d'/' -f1)")
                process.kill()
                print(f"--- killed pid-{process.pid} ---")
                break

