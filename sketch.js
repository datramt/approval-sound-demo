//sonificaton of approval/disapproval rating by datramt

//global declarations
let loopBeat;
let playPause;
let volumeSlider;
let counter;
let noteCounter;
 
//list of synths
let bassSynth, hhSynth, approvalSynth, disapprovalSynth;
let vol;

let table;
let rows;

let pg;

function setup() {
  createCanvas(500, 300);
  loadTable('https://projects.fivethirtyeight.com/trump-approval-data/approval_polllist.csv', 'csv', gotData, dataFailed);

  //Init counter to 0;
  counter = noteCounter = 0;

  //Assign & Init SYNTHS
  bassSynth = new Tone.MembraneSynth().toMaster();
  //Initialize parameters of hihat by inserting JSON
  hhSynth = new Tone.MetalSynth({
    "envelope": {
      "attack": 0.001,
      "decay": 0.01,
      "release": 0.01
    }
  }).toMaster();
  //set value of volume to -12 dB (default is too loud)
  hhSynth.volume.value = -16

   //SYNTHS
  //================================================\\

  approvalSynth = new Tone.FMSynth().toMaster();
  disapprovalSynth = new Tone.AMSynth().toMaster();

  //================================================\\


  //Audio/Loop initializations
  Tone.Transport.bpm.value = 160;
  loopBeat = new Tone.Loop(song, '16n');
  loopBeat.start(0);
  Tone.Master.volume.value = -Infinity;
}

function gotData(data) {

  table = data;

  console.log("current date: " + table.getString(1, 2));
  rows = table.findRows('All polls', 1);
  console.log(rows.length + ' polls found');

  pg = createGraphics(width, height);
  pg.background(80);
  pg.stroke(100, 355, 100);
  pg.strokeWeight(2);
  
  //APPROVAL
  for (i = 1; i < rows.length; i++) {
    pg.point(map(i - 1, 1, rows.length, 0, width), map(table.getNum(i, 13), 20, 80, height, 0));
  }

  //DISAPPROVAL 
  pg.stroke(255, 100, 100);
  for (i = 1; i < rows.length; i++) {
    pg.point(map(i - 1, 1, rows.length, 0, width), map(table.getNum(i, 14), 20, 80, height, 0));
  }

  image(pg, 0, 0);

  //UI
  playPause = createButton('play/pause').position(10, 10)
  playPause.mouseClicked(() => Tone.Transport.toggle())
  
  volumeSlider = createSlider(-60, 0, -60, 0).position(100, 10);
  volumeSlider.input(() => {
    if (volumeSlider.value() === -60) {
    	Tone.Master.volume.rampTo(-Infinity, 0.01) 
    } else {
    	Tone.Master.volume.rampTo(volumeSlider.value(), 0.01) 
    }
  });
}

function song(time) {

  if (counter % 4 === 0) {
    bassSynth.triggerAttackRelease('c1', '8n', time)
  }

  if (counter % 4 !== 1) { //eliminate the second of each set of four 16ths
    if (counter === 4 || counter === 12) { //target specific notes
      hhSynth.envelope.decay = 0.15 //set decay to long value (simulate OPEN hihat)
    } else {
      hhSynth.envelope.decay = 0.01 //set decay to short value (simulate CLOSED hihat)
    }
    hhSynth.triggerAttackRelease('16n', time, 1) //in all cases, trigger hihat
  }

   //synth riffs from table  
  //================================================\\

  approvalSynth.triggerAttackRelease(midiToFreq(10 + table.getNum(noteCounter + 1, 13)), '32n', time);
  disapprovalSynth.triggerAttackRelease(midiToFreq(10 + table.getNum(noteCounter + 1, 14)), '32n', time);

  //================================================\\

  Tone.Draw.schedule(() => {
    image(pg, 0, 0);

    //do drawing or DOM manipulation here
    stroke(255, 255, 100);
    line(map(noteCounter, 0, rows.length, 0, width), 0, map(noteCounter, 0, rows.length, 0, width), height);
  }, time)

  //create an incrementer that resets when it reaches 16
  
  noteCounter = (noteCounter + 1) % (rows.length)
	counter = noteCounter % 16
}

function dataFailed() {
  console.log('failed to load data');
}

function touchStarted() {
  if (Tone.context.state !== 'running') {
    Tone.context.resume();
  }
}