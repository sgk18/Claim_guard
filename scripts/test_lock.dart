import 'dart:io';

void main() {
  final file = File('C:\\flutter\\bin\\cache\\lockfile');
  print('Opening file...');
  final raf = file.openSync(mode: FileMode.write);
  print('Locking file...');
  raf.lockSync();
  print('File locked successfully!');
  raf.unlockSync();
  raf.closeSync();
  print('Done!');
}
