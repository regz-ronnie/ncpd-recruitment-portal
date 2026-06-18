import os, re
root = r'C:\Users\user\OneDrive\Desktop\NCPD recruitment portal\frontend\src'
files=[]
for dirpath, dirnames, filenames in os.walk(root):
    for fn in filenames:
        if fn.endswith(('.js','.jsx','.css','.txt')):
            files.append(os.path.relpath(os.path.join(dirpath, fn), root).replace('\\', '/'))
files.sort()
text=''
for path in files:
    if path.endswith(('.js','.jsx')):
        with open(os.path.join(root, path), 'r', encoding='utf-8', errors='ignore') as f:
            text += f.read() + '\n'
unused=[]
for path in files:
    if path.endswith(('.js','.jsx')):
        bn = os.path.splitext(os.path.basename(path))[0]
        count = len(re.findall(r'\\b' + re.escape(bn) + r'\\b', text))
        if count <= 1:
            unused.append((count, path))
print('TOTAL_FILES', len(files))
print('CANDIDATES')
for count, path in unused:
    print(f'{count:3d} {path}')
