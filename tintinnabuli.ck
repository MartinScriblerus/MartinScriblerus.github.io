Blit m => ADSR e => NRev rev => dac;
.4 => m.gain;
.1 => rev.mix;
e.set(5::ms, 3::ms, .5, 5::ms);
Gain tScaler => e;
0.25 => tScaler.gain;
Blit tNeg2 => tScaler;
Blit tNeg1 => tScaler;
Blit tPos1 => tScaler;
Blit tPos2 => tScaler;

// A minor scale
[220.0, 246.94, 261.63, 293.66, 329.63, 349.23, 392.0] @=> float scale[];
[130.81, 164.81, 261.63, 329.63] @=> float tPitch0[];
[164.81, 220.0, 261.63, 329.63] @=> float tPitch1[];
[164.81, 220.0, 329.63, 440.0] @=> float tPitch2[];
[220.0, 261.63, 329.63, 440.0] @=> float tPitch3[];
[220.0, 261.63, 440.0, 523.25] @=> float tPitch4[];
[261.63, 329.63, 440.0, 523.25] @=> float tPitch5[];
[261.63, 329.63, 440.0, 523.25] @=> float tPitch6[];

fun void configureVoice(Blit voice, int enable)
{
  1 => voice.harmonics;
  if (enable)
  {
    1.0 => voice.gain;
  }
  else
  {
    0 => voice.gain;
  }
}

fun void setPitch(Blit voice, int note, int number)
{
  if (note == 0)
    tPitch0[number] => voice.freq;
  else if (note == 1)
    tPitch1[number] => voice.freq;
  else if (note == 2)
    tPitch2[number] => voice.freq;
  else if (note == 3)
    tPitch3[number] => voice.freq;
  else if (note == 4)
    tPitch4[number] => voice.freq;
  else if (note == 5)
    tPitch5[number] => voice.freq;
  else if (note == 6)
    tPitch6[number] => voice.freq;
}

fun void sequence(int enableTNeg2, int enableTNeg1, int enableTPos1, int enableTPos2)
{
  configureVoice(tNeg2, enableTNeg2);
  configureVoice(tNeg1, enableTNeg1);
  configureVoice(tPos1, enableTPos1);
  configureVoice(tPos2, enableTPos2);

  for (0 => int i; i < scale.cap(); ++i)
  {
    setPitch(tNeg2, i, 0);
    setPitch(tNeg1, i, 1);
    setPitch(tPos1, i, 2);
    setPitch(tPos2, i, 3);

    scale[i] => m.freq;
    Math.random2(1, 5) => m.harmonics;

    e.keyOn();
    158::ms => now;
    e.keyOff();
    5::ms => now;
  }
}

<<<"No T voices">>>;
sequence(false, false, false, false);

while (true)
{
  <<<"T+1 enabled">>>;
  sequence(false, false, true, false);
  <<<"T+2 enabled">>>;
  sequence(false, false, false, true);
  <<<"T-1 enabled">>>;
  sequence(false, true, false, false);
  <<<"T-2 enabled">>>;
  sequence(true, false, false, false);
  <<<"T+1,T+2 enabled">>>;
  sequence(false, false, true, true);
  <<<"T-1,T+1 enabled">>>;
  sequence(false, true, true, false);
  <<<"T-2,T+1 enabled">>>;
  sequence(true, false, true, false);
  <<<"T-1,T+2 enabled">>>;
  sequence(false, true, false, true);
  <<<"T-2,T-1 enabled">>>;
  sequence(true, true, false, false);
  <<<"T-2,T+2 enabled">>>;
  sequence(true, false, false, true);
  <<<"T-1,T+1,T+2 enabled">>>;
  sequence(false, true, true, true);
  <<<"T-2,T+1,T+2 enabled">>>;
  sequence(true, false, true, true);
  <<<"T-2,T-1,T+1 enabled">>>;
  sequence(true, true, true, false);
  <<<"T-2,T-1,T+2 enabled">>>;
  sequence(true, true, false, true);
  <<<"T-2,T-1,T+1,T+2 enabled">>>;
  sequence(true, true, true, true);
}