'use strict';

const Joi = require('joi');
const fp = require('lodash/fp');

exports.seed = function (knex) {

  const table_name = 'products';
  const schema = require('../models/Products').joiSchema;

  const rows = [

    { //1
      product_name: 'Ark Dual Purpose Hitch Pin Lock - SLIMLINE DESIGN', 
      image_path: 'http://localhost:3001/products/p1.jpg',
      description: 'ARK DUAL PURPOSE HITCH PIN LOCK 5/8″ x 65MM/80MM. Ark Dual Purpose Hitch Pin Lock – Slimline Design, Can be used with or without lock. Suits 50.8mm (2”) x 50.8mm (2”) Class 4 Receivers From 65mm – 80mm',
      SKU: '350-00086',
      brand: 'Coast to Coast',
      shipping_weight: '1.0000kg',
      shipping_width: '20cm',
      shipping_height: '5cm',
      shipping_length: '18cm',
      shipping_cubic: '0.001800m3',
      unit_of_measure: 'ea',
      assembled_length: '90cm',
      assembled_height: '2cm',
      assembled_width: '2cm',
      price: 37,
      buy_button_link: 'https://www.rv4x4.net.au/ark-dual-purpose-hitch-pin-lock-5-8-x-65mm-80mm.-p'
    },


    { //2 
      product_name: 'Ampfibian mini 15AMP to 10AMP', 
      image_path: 'http://localhost:3001/products/p2.png',
      description: 'In a world where gizmos and gadgets are being micro-sized, Ampfibian have jumped on board in a teeny tiny way. <br/><br/>' +  
      'With all the same features as its big brother, the Ampfibian Mini is very capable at being a 15A to 10A power adapter. It allows you to connect 15A devices to domestic (10A) power points, safely and legally. <br/><br/>' +  
      'It is designed and made in Australia, and comes with a two year warranty and an IP33 rating (recommended for indoor use).<br/><br/>' +  
      'A true little orange powerhouse, the Ampfibian Mini has all the essentials such as RCD and overload protection, and a 10A circuit breaker which prevents overloading by cutting the power if it exceeds 10A (2400W).<br/>'  
      ,
      SKU: '500-04503',
      brand: 'Coast to Coast',
      shipping_weight: '1.0000kg',
      shipping_width: '20cm',
      shipping_height: '20cm',
      shipping_length: '20cm',
      shipping_cubic: '0.008000m3',
      unit_of_measure: null, 
      assembled_length: null, 
      assembled_height: null, 
      assembled_width: null, 
      price: 94,
      buy_button_link: 'https://www.rv4x4.net.au/amp-fibian-mini-15amp-to-10amp-adapter-w-overload'
    },


    //3
    { 
      product_name: 'ALKO 10″ SOLID TYRE JOCKEY WHEEL WITH SWIVEL CLAMP', 
      image_path: 'http://localhost:3001/products/p3-1.jpg,http://localhost:3001/products/p3-2.jpg',
      description: 'Alko 10″ Jockey Wheel with swivel clamp – has a large locking pin swivel bracket with a solid tyre (250mm diameter).',
      SKU: '450-00642',
      brand: 'Coast to Coast',
      shipping_weight: '12.0000kg',
      shipping_width: '20cm',
      shipping_height: '20cm',
      shipping_length: '60cm',
      shipping_cubic: '0.024000m3',
      unit_of_measure: 'ea',
      assembled_length: '75cm',
      assembled_height: '30cm',
      assembled_width: '30cm',
      price: 94,
      buy_button_link: 'https://www.rv4x4.net.au/alko-10-solid-tyre-jockey-wheel-c-w-swivel-clamp-4'
    },



    //4
    { 
      product_name: 'ALKO 10″ JOCKEY WHEEL – WITH CLAMP', 
      image_path: 'http://localhost:3001/products/p4.png',
      description: 'Alko 10″ Jockey Wheel – has a standard clamp with a solid tyre (250mm diameter), suitable for softer ground thanks to the larger wheel diameter',
      SKU: '450-00632',
      brand: 'Coast to Coast',
      shipping_weight: '1.0000kg',
      shipping_width: '20cm',
      shipping_height: '20cm',
      shipping_length: '20cm',
      shipping_cubic: '0.008000m3',
      unit_of_measure: null, 
      assembled_length: null, 
      assembled_height: null, 
      assembled_width: null, 
      price: 134,
      buy_button_link: 'https://www.rv4x4.net.au/alko-10-solid-tyre-jockey-wheel-c-w-clamp.-623650'
    },

    

    
    //5
    { 
      product_name: 'MULTI-USE BALL MOUNT – TOWING HITCH', 
      image_path: 'http://localhost:3001/products/p5-1.jpg,http://localhost:3001/products/p5-2.jpg,http://localhost:3001/products/p5-3.jpg',
      description: 'Now you can tow and use your receiver mounted bike carrier at the same time! <br/>'  + 
      '2″ x 2″ receiver mounted on top of ball mount <br/>' + 
      'Top receiver not to be used for towing – capacity 160kg <br/>' + 
      'Black powder coated finish <br/>' + 
      'Robotic welded for consistent quality <br/>' + 
      'Cnc machined for maximum accuracy <br/>' + 
      'Made tough for aussie conditions <br/>' + 
      'Fits 2″ x 2″ towbar receivers <br/>' + 
      'Gross trailer weight: 2722kg <br/>' + 
      'Tongue weight: 272kg <br/>' + 
      'Ball hole size: 7/8″ (22mm) <br/>' + 
      'Drop: 51mm (2″) <br/>' + 
      'Length: 316mm (measured from centre of pin hole to centre of ball hole) <br/>'  ,
      SKU: 'MH-SBM-1',
      brand: 'Roadsafe',
      shipping_weight: '5.0000kg',
      shipping_width: '20cm',
      shipping_height: '20cm',
      shipping_length: '45cm',
      shipping_cubic: '0.018000m3',
      unit_of_measure: 'ea',
      assembled_length: '45cm',
      assembled_height: '20cm',
      assembled_width: '30cm',
      price: 149,
      buy_button_link: 'https://www.rv4x4.net.au/multi-use-ball-mount-towing-hitch'
    },



    //6
    { 
      product_name: 'ADJUSTABLE MULTI-USE BALL MOUNT – TOWING HITCH', 
      image_path: 'http://localhost:3001/products/p6.jpg',
      description: 'Now you can tow and use your receiver mounted bike carrier at the same time! <br/>' +  
      'Quick adjustable drop and rise to suit most applications.<br/>' +  
      'Ball platform is reversible which gives you 8 adjustments<br/>' +  
      '2″ x 2″ receiver mounted on top of ball mount<br/>' +  
      'Top receiver not to be used for towing – capacity 160kg<br/>' +  
      'Black powder coated finish<br/>' +  
      'Robotic welded for consistent quality<br/>' +  
      'Cnc machined for maximum accuracy<br/>' +  
      'Made tough for aussie conditions<br/>' +  
      'Fits 2″ x 2″ towbar receivers<br/>' +  
      'Complies with j685 v-5 regulations<br/>' +  
      'Gross trailer weight: 2722kg<br/>' +  
      'Tongue weight: 272kg<br/>' +  
      'Ball hole size: 7/8″ (22mm)<br/>' +  
      'Drop: 51mm (2″)<br/>' +  
      'Length: 305mm (measured from centre of pin hole to centre of ball hole)<br/>' +  
      '(MH-ABM-MU) <br/>'  ,
      SKU: 'MH-ABM-MU',
      brand: 'Roadsafe',
      shipping_weight: '8.0000kg',
      shipping_width: '36cm',
      shipping_height: '10cm',
      shipping_length: '41cm',
      shipping_cubic: '0.014760m3',
      unit_of_measure: 'ea',
      assembled_length: '45cm',
      assembled_height: '20cm',
      assembled_width: '30cm',
      price: 197,
      buy_button_link: 'https://www.rv4x4.net.au/adjustable-multi-use-ball-mount-towing-hitch-mhabm'
    },


    

    //7
    { 
      product_name: 'CARAVAN STONE SHIELD WITH MESH 3PCE BLACK', 
      image_path: 'http://localhost:3001/products/p7.jpg',
      description: 'Caravan Stone Shield with mesh 3PCE Black (1800mm x 500mm) 450-06520<br/>' +   
                   'Protect your RV, and protect the life of its paintwork, by installing a Stone Shield. Supplied as a flat pack,<br/>' +   
                   'it is quick and easy to install to the A-frame of your camper trailer.<br/>' +   
                   'Made from tough rip stop mesh (resistant to rips or tears), the Stone Sheild stops stones (and other hard debris) from chipping, or potentially even denting your trailers paintwork.<br/>' +   
                   'Comes with two extra-large rubber mud flaps to protect the undercarriage of your camper. <br/>', 
      SKU: '450-06520',
      brand: 'Coast to Coast',
      shipping_weight: '10.0000kg',
      shipping_width: '50cm',
      shipping_height: '15cm',
      shipping_length: '120cm',
      shipping_cubic: '0.090000m3',
      unit_of_measure: 'ea',
      assembled_length: '50cm',
      assembled_height: '12cm',
      assembled_width: '180cm',
      price: 290,
      buy_button_link: 'https://www.rv4x4.net.au/camper-trailer-stone-shield-guard-with-mesh-3pce-b'
    },


    

    //8
    { 
      product_name: 'ADCO CRVCAC20 CARAVAN COVER 18-20′', 
      image_path: 'http://localhost:3001/products/p8-1.jpg,http://localhost:3001/products/p8-2.jpg',
      description: 'ADCO CRVCAC20 Caravan Cover 18-20′ (5508-6120mm) 400-06114<br/>' +    
      '2015 saw the introduction of a new era in RV protection in Australia and New Zealand, thanks to the American RV cover giant – ADCO – making their Designer Series covers exclusively available from Coast to Coast.<br/>' +    
      'Backed by a huge 3yr warranty, the ADCO Designer Series is available to suit Camper Trailers, Caravans, Pop Tops and Motorhomes.<br/>' +    
      'They’re designed for high sun exposure, high moisture, long term storage and even snow, making it the most durable cover on the market!  It features superior UV stabilised and breathable fabric that blocks out 99.8% of the suns damaging UV rays.<br/>' +    
      'On the Caravan, Pop Top and Motorhome models, there are zippered panels along one side.<br/>' +    
      'These allow you access to the interior of your RV whilst the cover is on, and because of the eyelets on these panels, they can also double as an awning!<br/>' +    
      'Features:<br/>' +    
      'Top panel is made of DuPontTM Tyvek® fabric which beads water on contact<br/>' +    
      'Side panels are made of four layers of polypropylene with a soft lining that won’t scratch your RV paintwork<br/>' +    
      'A cinching system with buckles prevent billowing fabric on the front and rear<br/>' +    
      'The lining of the cover is reinforced on all corners to protect against tears caused by sharp edges<br/>' +    
      'Air vents help to eliminate moisture build-up<br/>', 
 
      SKU: '400-06114',
      brand: 'Coast to Coast',
      shipping_weight: '18.0000kg',
      shipping_width: '35cm',
      shipping_height: '35cm',
      shipping_length: '40cm',
      shipping_cubic: '0.049000m3',
      unit_of_measure: 'ea',
      assembled_length: '400cm',
      assembled_height: '200cm',
      assembled_width: '200cm',
      price: 445,
      buy_button_link: 'https://www.rv4x4.net.au/adco-crvcac20-caravan-cover-18-20-5508-6120mm-.-62'
    },



    //9
    { 
      product_name: 'ADCO CRVCTC12 CARAVAN COVER 10-12′ (3060-3672MM)', 
      image_path: 'http://localhost:3001/products/p9.jpg',
      description: 'ADCO CRVCTC12 Caravan Cover 10-12′ (3060-3672mm) – 400-06100<br/>' + 
      'Protect your investment with the most durable cover on the market. ADCO covers feature a four layer Dupont Tyvek top panel which beads water on contact. ADCO’s all climate designer series is the No.1 selling cover in the US.<br/>' + 
      'ADCO covers come with a three year warranty unlike other covers on the market which only offer one year warranty. You’ve tried the rest, now try the best!.<br/>' + 
      '<b>Features:</b><br/>' + 
      'ADCO CRVCTC12 Caravan Cover 10-12′ (3060-3672mm) – 400-06100<br/>' + 
      'Designed for high sun exposure, high moisture, snow and/or long term storage<br/>' + 
      'The most durable all climate cover on the market<br/>' + 
      'Four layer Dupont Tyvek RV®top panel beads water on contact<br/>' + 
      'High performance polypropylene side panels<br/>' + 
      'Completely breathable<br/>' + 
      'Superior U.V stability effectively blocks 99.8% of suns damaging UV rays that can fade interior and exterior surfaces<br/>' + 
      'Front & rear cinching system for loose fabric<br/>' + 
      'Extra re enforcements on top and bottom of all 4 corners helps against sharp edges and reduces wear<br/>' + 
      'Attached straps and buckles prevent blowing<br/>' + 
      'Storage bag included<br/>' + 
      'Air vents prevent mould and mildew<br/>' + 
      '3 Year manufacturer’s warranty<br/>', 
 
      SKU: '400-06100',
      brand: 'Coast to Coast',
      shipping_weight: '16.0000kg',
      shipping_width: '35cm',
      shipping_height: '35cm',
      shipping_length: '40cm',
      shipping_cubic: '0.049000m3',
      unit_of_measure: 'ea',
      assembled_length: null, 
      assembled_height: null, 
      assembled_width: null, 
      price: 250,
      buy_button_link: 'https://www.rv4x4.net.au/adco-crvctc12-camper-trailer-cover-10-12-3060-3672'
    },


    
    //10
    { 
      product_name: '5.8″ CARAVAN REVERSING CAMERA SYSTEM WITH REAR CAMERA', 
      image_path: 'http://localhost:3001/products/p10.jpg',
      description: 'CARAVAN REVERSING CAMERA SYSTEM – 900-02820<br/>' +  
      'Reverse in safety, Ideal for caravans and horse floats.<br/>' +  
      'The package includes:<br/>' +  
      'A 5.8” LCD screen with sun shield to reduce glare.<br/>' + 
      'An eyeball camera – fully waterproof and carries audio, video, and night vision infrared.<br/>' + 
      'A 15mt 4-pin cable – waterproof, carries audio, video and power.<br/>' + 
      'A 7.5mt 4-pin cable – waterproof, carries audio, video and power.<br/>' +  
      'A suction mount – enables you to mount your screen onto the dashboard, connects to the windscreen or any other area that allows the cup to work<br/>' +  
      'Monitor has the capacity to accept a second video input.<br/>' +
      '(900-02820)<br/>', 
 
      SKU: '900-02820',
      brand: 'Coast to Coast',
      shipping_weight: '1.5000kg',
      shipping_width: '20cm',
      shipping_height: '10cm',
      shipping_length: '30cm',
      shipping_cubic: '0.006000m3',
      unit_of_measure: 'ea',
      assembled_length: '30cm',
      assembled_height: '10cm',
      assembled_width: '20cm',
      price: 457,
      buy_button_link: 'https://www.rv4x4.net.au/5.8-caravan-reversing-camera-system'
    },


        //11
        { 
          product_name: '12MM WHITE NON TOXIC WATER HOSE WITH FITTINGS – 10M', 
          image_path: 'http://localhost:3001/products/p11.jpg',
          description: '12mm hose for the conveyance of drinking water, comes with fittings installed. <br/>' + 
          'Proudly Australian made.<br/>' +
          'Conforms to AS/NZS 2070 (Plastics for food contact).<br/>' +
          'Excellent U.V. resistance to withstand extreme Australian conditions.<br/>' +
          'Manufactured from Phthalate free compound.<br/>' +
          'Specially manufactured as to not taint the water.<br/>' +
          'Specifications<br/>' +
          'Inner Core: White non tainting Polyolefin with smooth finish.<br/>' +
          'Reinforcing: High tenacity polyester yarn.<br/>' +
          'Outer Cover: U.V. stabilised clear Polyolefin with a smooth finish.<br/>' +
          'Fittings: Fitted with Perma-connect fittings c/w tap adaptor.<br/>' + 
          '(800-01366)<br/>', 
     
          SKU: '800-01366',
          brand: 'Coast to Coast',
          shipping_weight: '3.0000kg',
          shipping_width: '30cm',
          shipping_height: '10cm',
          shipping_length: '30cm',
          shipping_cubic: '0.009000m3',
          unit_of_measure: 'ea',
          assembled_length: null, 
          assembled_height: null, 
          assembled_width: null, 
          price: 42,
          buy_button_link: 'https://www.rv4x4.net.au/12mm-white-non-toxic-water-hose-with-fittings-10mt'
        },
    

        
        //12
        { 
          product_name: 'SPOT TRACE THEFT-ALERT TRACKING DEVICE – SPOTTR', 
          image_path: 'http://localhost:3001/products/p12-1.jpg,http://localhost:3001/products/p12-2.jpg,http://localhost:3001/products/p12-3.jpg',
          description: 'SPOT Trace is the theft-alert tracking device powered by 100% satellite technology. The tiny, lightweight device allows you to track anything, anytime and anywhere – from your boat to your car, jet ski or motorbike. ' + 
          'When the SPOT Trace detects movement it will automatically notify you of its GPS coordinates via SMS or email, so you know exactly where your valuable assets are.<br/>' +  
          'The SPOT TRACE offers advanced theft-alert tracking for anything. Instantly receive a text or email when your most valuable assests move anywhere, or follow them on Google Maps anytime on your phone or computer.<br/>'+ 
          'Affordable and easy to use, SPOT TRACE is a no-brainer for your cars, boats, motorcycles, toys and other valuables. No Worries!<br/>'+ 
          'Spot Trace Subscription Rates *Including GST<br/>'+ 
          'Basic Tracking: USD$175.99 for a 12 Month Subscription.<br/>'+
          'Custom tracking every 5,10,30 and 60 minutes.<br/>'+
          'Automatic text or email notification when movement is detected.<br/>'+
          'View GPS coordinates online anytime.<br/>'+
          'Custom Dock mode, movement alert,status,low battery and power off settings.<br/><br/>'+
          
          'Extreme Tracking: USD$241.98 for a 12 Month Subscription.<br/>'+
          'Custom tracking every 2.5, 5,10,30 and 60 minutes.<br/>'+
          'Automatic text or email notification when movement is detected.<br/>'+
          'View GPS coordinates online anytime.<br/>'+
          'Custom Dock mode, movement alert,status,low battery and power off settings.<br/><br/>'+
          
          'This unit does not include the waterproof power cable and relies on the internal batteries to operate<br/><br/>'+
          
          'This is a subscription based tracking service, tracking is not included in the unit buy price and is an additional charge paid upon activation and registration of the unit<br/><br/>'+
          
          'SPOT Trace Features<br/>'+
          
          '• Receive text or email messages when movement is detected.<br/>'+
          '• Monitor assets in near real time using Google Maps™.<br/>'+
          '• Satellite technology tracks beyond the reach of normal mobile network coverage.<br/>'+
          '• Select from 2.5 through to 60 minute tracking intervals.<br/>'+
          '• Compact and easy to install.<br/>'+
          '• Long battery life and plug in power options.<br/><br/>'+ 

          'How it works<br/><br/>'+
          
          'SPOT Trace uses satellites to send tracking points and messages, so its signal needs a clear path to the sky.<br/>'+ 
          'The signal will go through glass and fiberglass but cannot pass through metal or wood.<br/>'+ 
          'The SPOT Trace will send a signal to the satellite with its GPS coordinates at intervals determined by you.<br/>'+ 
          'When movement is detected, the SPOT Trace will send you an email or SMS notification with its GPS coordinates.<br/>'+ 
          'You can use the SPOT web based user console to track your asset in near real time using Google Maps®<br/><br/>'+
          
          '<b>Notifications</b><br/><br/>'+
          
          '• Tracking – View your assets GPS coordinates using the online user console.<br/>'+
          '• Movement Alerts – Receive a notification when SPOT’s vibration sensor detects your asset has new movement.<br/>'+
          '• Dock Mode – Configure SPOT Trace to track an asset that is primarily stored on the water.<br/>'+
          '• Power Off Message – Receive a notification of SPOT Trace is powered off.<br/>'+
          '• Low Battery Message – Receive notification when SPOT Trace’s batteries are low.<br/>'+
          '• Status Message – Receive a daily alert to let you know your asset is secure<br/>'+
          
          'SPOT Trace Specifications<br/><br/>'+
          
          '• Size: 51.3 x 68.3 x 21.4 mm<br/>'+
          '• Weight: 87.9g<br/>'+
          '• Operating Temp: -30c to 60c<br/>'+
          '• Operating temperature: -20 C to +60 C<br/>'+
          '• Operating altitude: -100m to +6500m<br/>'+
          '• Humidity rated: MIL-STD-810F, Method 507.3, 95% to 100%<br/>'+
          '• Vibration rated: Per SAE J1455<br/>'+
          '• Waterproof rated: IPX7 (1m for up to 30 minutes).<br/>'+
          '• Battery type:<br/>'+
          '– 4AAA lithium batteries,<br/>'+
          '– Line Power with a 5v USB connection<br/>'+
          '• Mounting Options:<br/>'+
          '– Reversable mounting brackets<br/>'+
          '– Industrial strength double sided tape<br/>'+
          '– Adhesive grip<br/>'+
          '– Adhesive hook and loop tape<br/>', 
     
          SKU: null, 
          brand: null, 
          shipping_weight: null, 
          shipping_width: null, 
          shipping_height: null, 
          shipping_length: null, 
          shipping_cubic: null, 
          unit_of_measure: null, 
          assembled_length: null, 
          assembled_height: null, 
          assembled_width: null, 
          price: 219,
          buy_button_link: 'https://www.rv4x4.net.au/spot-trace-theft-alert-tracking-device-spottr'
        },



         //13
         { 
          product_name: 'TEKONSHA PRIMUS IQ PORTABLE BRAKE UNITS (PEBS)', 
          image_path: 'http://localhost:3001/products/p13-1.jpg,http://localhost:3001/products/p13-2.jpg,http://localhost:3001/products/p13-3.jpg',
          description: 'TEKONSHA PRIMUS IQ PORTABLE BRAKE UNITS (PEBS)<br/>' +
          'WE ARE NOW SELLING THE BEST QUALITY AND BEST MADE PEBS IN AUSTRALIA<br/>'+
          'Tekonsha Primus iQ Portable Brake Units – $360 inc GST plus postage <br/>'+
          'A totally proportional electric trailer brake control unit which is self-levelling so no level adjustment is necessary. With its LED voltage display and ALKO stability control compatibility this kit is by far the best solution at this pricing level.<br/><br/>'+
          
          'This kit is setup to be used as a portable device with no hard wiring required. Simply plug into your 12v cig lighter socket and run the leads to the supplied 7pin to 12 pin trailer plug and your ready to tow any caravan, camper or trailer with electric brakes.<br/><br/>'+
          
          'Boost feature that gives users the ability to apply more initial trailer braking when towing heavier trailers.<br/>'+
          'It works proportionally in reverse<br/>'+
          'Removable electrical connector that allows the unit to be quickly stored when not in use.<br/>'+
          'Digital readout showing voltage delivery to the trailer brakes<br/>'+
          '100% compatible with ALKO stability control system.<br/>'+
          
          'Additional adaptors available on request and are easily changeable via our quick connect plugs.<br/><br/>'+
          
          'Package Contents:<br/>'+
          '1 x Primus IQ brake controller<br/>'+
          '1 x Power & connection cables<br/>'+
          '1 x Adaptor 12pin flat female to 7pin flat male (additional adaptors available on request)<br/>'+
          'Instruction manual<br/><br/>'+
          
          'Cautions<br/><br/>'+
          'Please note due to being a portable device running 12v power from your cig lighter socket the unit is limited to braking to single & tandem trailers. It is not suitable to operate brakes on a triple axle trailer unless the unit is hard wired as per the manufactures installation instructions.<br/>'+
          
          'This product is supplied to allow ease of fitment in vehicles that require a non-permanent installation. All mounting orientation and operational requirements in the Brake Controller manufacturers product manual still apply, and must be followed to ensure safe operation.<br/>'+
          
          'Road rules relating to towing may vary between Australian State jurisdictions. It is advisable to check the trailer brake requirements in your state to ensure that you are fully compliant with local regulations.<br/>' +
          '(TekPEB)', 
     
          SKU: null, 
          brand: null, 
          shipping_weight: null, 
          shipping_width: null, 
          shipping_height: null, 
          shipping_length: null, 
          shipping_cubic: null, 
          unit_of_measure: null, 
          assembled_length: null, 
          assembled_height: null, 
          assembled_width: null, 
          price: 360,
          buy_button_link: 'https://www.rv4x4.net.au/tekonsha-primus-iq-portable-brake-units-pebs'
        },


         //14
         { 
          product_name: '12 TO 7 FLAT PIN ADAPTORS', 
          image_path: 'http://localhost:3001/products/p14-1.jpg,http://localhost:3001/products/p14-2.jpg,http://localhost:3001/products/p14-3.jpg',
          description: '12 TO 7 FLAT PIN ADAPTORS – $70  INC. GST<br/>'+
          'Do you have a 12 pin flat plug on your Caravan, Camper Trailer or Trailer but only only a 7 pin flat or round plug on your vehicle? <br/>' +  
          'Well here is your super easy solution to that problem!!<br/>' + 
          'Quality custom Australian made in QLD: <br/>' + 
          '12 pin flat to 7 pin flat adaptor <br/>' +
          'ORDER YOURS NOW!',  
          SKU: null, 
          brand: null, 
          shipping_weight: null, 
          shipping_width: null, 
          shipping_height: null, 
          shipping_length: null, 
          shipping_cubic: null, 
          unit_of_measure: null, 
          assembled_length: null, 
          assembled_height: null, 
          assembled_width: null, 
          price: 70,
          buy_button_link: 'https://www.rv4x4.net.au/12-to-7-flat-pin-adaptors'
        },
     
 
  ];

  return knex(table_name)
  .then(async () => {
    try {
      const list = rows.map((row) => {
        const item = Joi.validate(row, schema);
        const error = fp.get('error', item); 

        if (!fp.isEmpty(error)) {
          throw error;
        }

        return item.value;
      });

      const result = await knex.insert(list).into(table_name); 
      try{ //postgres indexing  fix. try catch because this doesnt work for mysql 
        await knex.raw("alter sequence 	" + table_name + "_id_seq restart with "+ (rows.length  + 1) +"; ") ;   
      }catch(e){ 
      }
      return result;
      
    }
    catch (error) {
      if (error.message.indexOf('violates unique constraint "'+table_name+'_pkey"') > -1){
        return console.log('SEED ALREADY EXISTS');
      }

      throw error;
    }
  });
};