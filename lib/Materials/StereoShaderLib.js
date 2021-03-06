/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Shader library for rendering stereo textures
 *
 * Part of this code is source from meshbasic_vert.glsl and meshbasic_frag.glsl
 * of Three.js
 * https://github.com/mrdoob/three.js/
 */

var StereoShaderLib = {
  stereo_basic_vert: "\n      uniform vec4 stereoOffsetRepeat;\n      uniform vec3 color;\n      #ifdef USE_ENVMAP\n        varying vec3 vWorldPosition;\n        varying vec3 vNormal;\n      #endif\n      varying lowp vec3 vColor;\n      #ifdef USE_MAP\n        varying highp vec2 vUv;\n      #endif\n      void main()\n      {\n          #ifdef USE_MAP\n            vUv = uv * stereoOffsetRepeat.zw + stereoOffsetRepeat.xy;\n          #endif\n          vColor = color;\n\n          #ifdef USE_ENVMAP\n            vec4 worldPosition = modelMatrix * vec4( position, 1.0 );\n            vWorldPosition = worldPosition.xyz;\n            vNormal = normalMatrix * normal;\n          #endif\n\n          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n      }\n  ",

  stereo_basic_frag: "\n      #define RECIPROCAL_PI2 0.15915494\n      uniform vec4 stereoOffsetRepeat;\n      uniform float opacity;\n      uniform sampler2D map;\n      #ifdef USE_ENVMAP\n        varying vec3 vWorldPosition;\n        varying vec3 vNormal;\n        #ifdef ENVMAP_TYPE_CUBE\n          uniform samplerCube envMap;\n        #else\n          uniform sampler2D envMap;\n        #endif\n        uniform float reflectivity;\n        uniform float flipEnvMap;\n        uniform float refractionRatio;\n      #endif\n      #ifdef USE_MAP\n        varying highp vec2 vUv;\n      #endif\n      varying lowp vec3 vColor;\n      void main()\n      {\n        vec4 diffuseColor = vec4( 1.0, 1.0, 1.0, opacity );\n\n        #ifdef DOUBLE_SIDED\n          float flipNormal = ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n        #else\n          float flipNormal = 1.0;\n        #endif\n\n        #ifdef USE_MAP\n          vec4 texColor = texture2D( map, vUv );\n          diffuseColor *= texColor;\n        #endif\n\n        #ifdef USE_ENVMAP\n          vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );\n          vec3 worldNormal = normalize( ( vec4( vNormal, 0.0 ) * viewMatrix ).xyz );\n          vec3 reflectVec = refract( cameraToVertex, worldNormal, refractionRatio );\n\n          #ifdef ENVMAP_TYPE_CUBE\n            vec4 envColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );\n          #elif defined( ENVMAP_TYPE_EQUIREC )\n            vec2 sampleUV;\n            sampleUV.y = saturate( flipNormal * reflectVec.y * 0.5 + 0.5 );\n            sampleUV.x = atan( flipNormal * reflectVec.z, flipNormal * reflectVec.x ) * RECIPROCAL_PI2 + 0.5;\n            vec2 stereoSampleUV = sampleUV * stereoOffsetRepeat.zw + stereoOffsetRepeat.xy;\n            vec4 envColor = texture2D( envMap, stereoSampleUV );\n          #elif defined( ENVMAP_TYPE_SPHERE )\n            vec3 reflectView = flipNormal * normalize( ( viewMatrix * vec4( reflectVec, 0.0 ) ).xyz\n              + vec3( 0.0, 0.0, 1.0 ) );\n            vec2 sampleUV = reflectView.xy * 0.5 + 0.5;\n            vec2 stereoSampleUV = sampleUV * stereoOffsetRepeat.zw + stereoOffsetRepeat.xy;\n            vec4 envColor = texture2D( envMap, stereoSampleUV );\n          #else\n            vec4 envColor = vec4( 0.0 );\n          #endif\n          diffuseColor.rgb = mix( diffuseColor.rgb, diffuseColor.rgb * envColor.rgb, reflectivity );\n        #endif\n\n        diffuseColor.rgb *= vColor;\n        gl_FragColor = diffuseColor;\n      }\n  "
};

exports.default = StereoShaderLib;