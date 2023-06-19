enum VoxType {
    NONE = 0,
    TWEET = 1,
    LAUGH = 2,
    SNORE = 3,
    DOO = 4,
    QUERY = 5,
    UHOH = 6,
    MOAN = 7,
    DUHoolo = 8,
    WAAH = 9,
    GROWL = 10
}

// code this defensively, in case SoundExpression field-locations change in future
const startVolPos = 1
const startFreqPos = 5
const durationPos = 9
const endVolPos = 26
const endFreqPos = 18

class Utterance {
    //properties
    type: VoxType;
    partA: SoundExpression;
    partB: SoundExpression;
    partC: SoundExpression;
    freqFactor0: number;
    freqFactor1: number;
    freqFactor2: number;
    freqFactor3: number;
    volFactor0: number;
    volFactor1: number;
    volFactor2: number;
    volFactor3: number;
    timeFactor1: number;
    timeFactor2: number;
    timeFactor3: number;

    // initally base all three parts on freq=333Hz, vol=222, ms = 999 (333 each)
    constructor(vox: VoxType, freq0: number, vol0: number,
        waveA: WaveShape, fxA: SoundExpressionEffect, shapeA: InterpolationCurve,
        freq1: number, vol1: number, ms1: number,
        waveB: WaveShape, fxB: SoundExpressionEffect, shapeB: InterpolationCurve,  // (optional part B)
        freq2: number, vol2: number, ms2: number,
        waveC: WaveShape, fxC: SoundExpressionEffect, shapeC: InterpolationCurve,  // (optional part C)
        freq3: number, vol3: number, ms3: number) {

        this.freqFactor0 = freq0;
        this.volFactor0 = vol0;
        this.freqFactor1 = freq1;
        this.volFactor1 = vol1;
        this.timeFactor1 = ms1;
        this.partA = music.createSoundExpression(waveA, freq0 * 333, freq1 * 333,
            vol0 * 222, vol1 * 222, ms1 * 999, fxA, shapeA)

        if (waveB === undefined) {    // only partA was needed
            this.partB = "unused";
            this.partC = "unused";
        } else {
            // we have a PartB...
            this.freqFactor2 = freq2;
            this.volFactor2 = vol2;
            this.timeFactor2 = ms2;
            this.partB = music.createSoundExpression(waveB, freq1 * 333, freq2 * 333,
                vol1 * 222, vol2 * 222, ms2 * 999, fxB, shapeB)

            if (waveC === undefined) {    // only partA & partB needed
                this.partC = "unused";
            } else {
                // we have a PartC as well...

                this.freqFactor3 = freq3;
                this.volFactor3 = vol3;
                this.timeFactor3 = ms3;
                this.partA = music.createSoundExpression(waveC, freq2 * 333, freq3 * 333,
                    vol2 * 222, vol3 * 222, ms3 * 999, fxC, shapeC)
            }
        }
    }

    // methods... 
    utterUsing(this, freq: number, vol: number, ms: number) {
        // adjust PartA duration, frequencies and volumes 
        this.partA = assemble(this.partA, durationPos, formatNumber(ms * this.timeFactor1, 4), 4);
        this.partA = assemble(this.partA, startFreqPos, formatNumber(freq * this.freqFactor0, 4), 4);
        this.partA = assemble(this.partA, startVolPos, formatNumber(vol * this.volFactor0, 4), 4);
        let nextFreqStr = formatNumber(freq * this.freqFactor1, 4);
        let nextVolStr = formatNumber(vol * this.volFactor1, 4);
        this.partA = assemble(this.partA, endFreqPos, nextFreqStr, 4);
        this.partA = assemble(this.partA, endVolPos, nextVolStr, 4);

        if (this, partB !== "unused") {
        // adjust PartB duration, frequencies and volumes
            this.partB = assemble(this.partB, durationPos, formatNumber(ms * this.timeFactor2, 4), 4);
            this.partB = assemble(this.partB, startFreqPos, nextFreqStr, 4);
            this.partB = assemble(this.partB, startVolPos, nextVolStr, 4);
            let nextFreqStr = formatNumber(freq * this.freqFactor2, 4);
            let nextVolStr = formatNumber(vol * this.volFactor2, 4);
            this.partB = assemble(this.partB, endFreqPos, nextFreqStr, 4);
            this.partB = assemble(this.partB, endVolPos, nextVolStr, 4);

            if (this, partC !== "unused") {
                // adjust PartC duration, frequencies and volumes
                this.partC = assemble(this.partC, durationPos, formatNumber(ms * this.timeFactor3, 4), 4);
                this.partC = assemble(this.partC, startFreqPos, nextFreqStr, 4);
                this.partC = assemble(this.partC, startVolPos, nextVolStr, 4);
                this.partC = assemble(this.partA, endFreqPos, formatNumber(freq * this.freqFactor3, 4), 4);
                this.partC = assemble(this.partA, endVolPos, formatNumber(vol * this.volFactor3, 4), 4);
            }
        }
        music.play(this.partA, music.PlaybackMode.UntilDone);
        if (this, partB !== "unused") {
            music.play(this.partB, music.PlaybackMode.UntilDone);
            if (this, partC !== "unused") {
                music.play(this.partC, music.PlaybackMode.UntilDone);

            }
        }
    }

    // internal tools...
    assemble(express: string, offset: number, digits: string, length: number): string {
        return express.substr(0, offset) + digits + express.substr(offset + length);
    }

    value = Math.constrain(value | 0, 0, Math.pow(10, length) - 1);
    formatNumber(value, length)

    protected formatNumber(num: number, length: number) {
        let result = num + "";
        while (result.length < length) result = "0" + result;
        return result;
    }
}





// utterances
let moan = new Utterance(VoxType.MOAN, 1.30, 150,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    1.00, 250, 0.60,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    0.95, 200, 0.30,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Linear,
    1.15, 133, 0.10);

/*

TWEET	0.80	1.20	
SIN	NONE	LOG	1.00, 200, 0.90
*/
let tweet = new Utterance(VoxType.TWEET, 0.8, 1.20,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Logarithmice,
    1.00, 200, 0.90,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    0.95, 200, 0.30,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Linear,
    1.15, 133, 0.10);

LAUGH	70	100	
SAW	NONE	LOG	100	250	10	
SQU	NONE	LIN	70	180	90
let moan = new Utterance(VoxType.MOAN, 1.30, 150,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    1.00, 250, 0.60,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    0.95, 200, 0.30,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Linear,
    1.15, 133, 0.10);

SNORE -3508	25
NOI	VIB	LIN -715	250	50	
NOI	VIB	LIN - 5000	10	50
let moan = new Utterance(VoxType.MOAN, 1.30, 150,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    1.00, 250, 0.60,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    0.95, 200, 0.30,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Linear,
    1.15, 133, 0.10);


DOO	300	200	
SAW	NONE	LOG	100	220	95	
SQU	NONE	LIN	100	180	5
let moan = new Utterance(VoxType.MOAN, 1.30, 150,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    1.00, 250, 0.60,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    0.95, 200, 0.30,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Linear,
    1.15, 133, 0.10);


QUERY	110	50	
SQU	NONE	LIN	100	250	70	
SQU	NONE	CUR	150	50	20
let moan = new Utterance(VoxType.MOAN, 1.30, 150,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    1.00, 250, 0.60,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    0.95, 200, 0.30,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Linear,
    1.15, 133, 0.10);


UHOH	110	100	
SAW	NONE	LOG	140	250	20
NON					25	
SQU	NONE	LIN	100	180	55
let moan = new Utterance(VoxType.MOAN, 1.30, 150,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    1.00, 250, 0.60,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    0.95, 200, 0.30,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Linear,
    1.15, 133, 0.10);


MOAN	130	150	TRI	
NONE	CUR	100	250	60	
TRI	NONE	CUR	95	200	30	
TRI	NONE	LIN	115	133	10
let moan = new Utterance(VoxType.MOAN, 1.30, 150,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    1.00, 250, 0.60,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    0.95, 200, 0.30,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Linear,
    1.15, 133, 0.10);


DUH	100	150	
SQU	NONE	LIN	95	200	30	
SQU	NONE	LIN	110	250	10	
SQU	NONE	LIN	66	90	60
let moan = new Utterance(VoxType.MOAN, 1.30, 150,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    1.00, 250, 0.60,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    0.95, 200, 0.30,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Linear,
    1.15, 133, 0.10);


WAAH	100	25	
SAW	NONE	CUR	140	250	70	
SAW	NONE	LIN	110	50	20	
SAW	NONE	LIN	30	10	10
let moan = new Utterance(VoxType.MOAN, 1.30, 150,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    1.00, 250, 0.60,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    0.95, 200, 0.30,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Linear,
    1.15, 133, 0.10);


GROWL	30	120	
SAW	NONE	LOG	100	200	60	
SAW	NONE	LIN	90	250	15	
SAW	NONE	LIN	30	180	15
let moan = new Utterance(VoxType.MOAN, 1.30, 150,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    1.00, 250, 0.60,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    0.95, 200, 0.30,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Linear,
    1.15, 133, 0.10);

*/

function emitWaah(pitch: number, ms: number) {
    music.play(music.createSoundExpression(WaveShape.Sawtooth, pitch, 1.4 * pitch,
        27, 255, 0.2 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Curve), music.PlaybackMode.UntilDone)
    music.play(music.createSoundExpression(WaveShape.Sawtooth, 1.4 * pitch, 1.1 * pitch,
        255, 50, 0.7 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
    music.play(music.createSoundExpression(WaveShape.Sawtooth, 1.1 * pitch, 0.3 * pitch,
        50, 10, 0.1 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
}

function emitLaugh(pitch: number, ms: number){
    music.play(music.createSoundExpression(WaveShape.Sawtooth, 0.7 * pitch, pitch,
        100, 255, 0.9 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Logarithmic), music.PlaybackMode.UntilDone)
    music.play(music.createSoundExpression(WaveShape.Square, pitch, 0.7 * pitch,
        255, 180, 0.1 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
    
}
function emitSnore(ms: number) {
    basic.showIcon(IconNames.Asleep)
    music.play(music.createSoundExpression(WaveShape.Noise, 3508, 715,
        27, 255, 0.5 * ms, SoundExpressionEffect.Vibrato,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
    music.play(music.createSoundExpression(WaveShape.Noise, 847, 5000,
        255, 10, 0.5 * ms, SoundExpressionEffect.Vibrato,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
}
function emitUhOh(pitch: number, ms: number) {
    music.play(music.createSoundExpression(WaveShape.Sawtooth, 1.1 * pitch, 1.4 * pitch,
        100, 255, 0.25 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Logarithmic), music.PlaybackMode.UntilDone)
    basic.pause(0.2 * ms)     // glottal-stop
    music.play(music.createSoundExpression(WaveShape.Square, 1.1 * pitch, pitch,
        255, 180, 0.55 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
}
function emitDoo(pitch: number, ms: number) {
    music.play(music.createSoundExpression(WaveShape.Sawtooth, 3 * pitch, pitch,
        200, 220, 0.05 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Logarithmic), music.PlaybackMode.UntilDone)
    music.play(music.createSoundExpression(WaveShape.Square, pitch, pitch,
        220, 180, 0.95 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
}
// ...stops abruptly
function emitTweet(pitch: number, ms: number) {
    music.play(music.createSoundExpression(WaveShape.Sine, 0.8 * pitch, pitch,
        120, 200, 0.9 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Logarithmic), music.PlaybackMode.UntilDone)
}
function emitGrowl(pitch: number, ms: number) {
    music.play(music.createSoundExpression(WaveShape.Sawtooth, 0.3 * pitch, pitch,
        120, 200, 0.2 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Logarithmic), music.PlaybackMode.UntilDone)
    music.play(music.createSoundExpression(WaveShape.Sawtooth, pitch, 0.95 * pitch,
        200, 255, 0.6 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
    music.play(music.createSoundExpression(WaveShape.Sawtooth, 0.95 * pitch, 0.3 * pitch,
        255, 180, 0.15 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
}



function dumDiDum(repeat: number, period: number) {
    quiet = false
    ave = period / repeat
    pitch = randint(200, 350)
    for (let index = 0; index < repeat; index++) {
        span = randint(0.2 * ave, 1.8 * ave)
        if (span > 0.5 * ave) {
            // mostly "Dum"...
            emitDoo(randint(150, 300), span)
        } else {
            // .. with occasional "Di"
            emitDoo(randint(350, 500), 0.15 * ave)
        }
        basic.pause(100)
    }
    quiet = true
}
function grumble(repeat: number, period: number) {
    quiet = false
    ave = period / repeat
    basic.showIcon(IconNames.Sad)
    for (let index = 0; index < repeat; index++) {
        span3 = randint(0.4 * ave, 1.8 * ave)
        emitUhOh(randint(100, 300), span3)
    }
    quiet = true
}
function giggle(repeat: number, period: number) {
    quiet = false
    ave = period / repeat
    pitch = randint(400, 600)
    for (let index = 0; index < repeat; index++) {
        span2 = randint(0.4 * ave, 1.8 * ave)
        emitLaugh(pitch, span2)
        pitch = 0.9 * pitch
        basic.pause(100)
    }
    quiet = true
}
function whistle(repeat: number, period: number) {
    quiet = false
    ave = period / repeat
    for (let index = 0; index < repeat; index++) {
        span2 = randint(0.4 * ave, 1.8 * ave)
        emitTweet(randint(600, 1200), span2)
        basic.pause(100)
    }
    quiet = true
}



input.onButtonPressed(Button.A, function () {
    if (quiet) {
        whistle(15, 3000)
    }
})
input.onButtonPressed(Button.B, function () {
    if (quiet) {
        dumDiDum(10, 3000)
    }
})
input.onPinPressed(TouchPin.P1, function () {
    if (quiet) {
        grumble(10, 1000)
    }
})
input.onPinPressed(TouchPin.P2, function () {
    if (quiet) {
        for (let index = 0; index < 6; index++) {
            emitSnore(1000)
        }
    }
})
input.onGesture(Gesture.Shake, function () {
    if (quiet) {
        giggle(7, 800)
    }
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (quiet) {
        emitGrowl(300, 500)
    }
})
let quiet = true
let span = 0
let span2 = 0
let pitch = 0
let span3 = 0
let ave = 0
music.setBuiltInSpeakerEnabled(false)
pins.touchSetMode(TouchTarget.P1, TouchTargetMode.Capacitive)
pins.touchSetMode(TouchTarget.P2, TouchTargetMode.Capacitive)
