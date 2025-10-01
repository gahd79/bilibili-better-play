// ==UserScript==
// @name         B站播放体验改善
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  可以在配置选项config内设置自定义不同up主视频的播放设置
// @author       gahd
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/bangumi/play/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  // 配置选项
  const config = {
    enableLogging: true, // 启用日志

    // 特定UP主列表（需要开启2.0倍速和自动连播的UP主）
    specialUps: [{
      up: '黑马程序员', //up主名称
      subtitle: true, //是否开启字幕,true为开启
      rate: 2, //设置播放速度
      autoPlay: true, //是否开启自动连播,true为开启
      dm: false //是否开启弹幕,true为开启
    }, {
      up: 'xxx',
      subtitle: false,
      rate: 1,
      autoPlay: false,
      dm: true
    }]
  };

  // 日志函数
  function log(message) {
    if (config.enableLogging) {
      console.log(`[B站播放体验改善] ${message}`);
    }
  }


  // 检查当前UP主是否在特殊列表中
  function isSpecialUp() {
    // 查找UP主名称元素
    const upNameElement = document.querySelector('.up-name') || document.querySelector('.staff-name')

    let specialInfo = { isSpecial: false };
    if (!upNameElement) {
      log('未找到UP主信息');
      return specialInfo;
    }
    const upName = upNameElement.textContent.trim();
    log(`当前UP主: ${upName}`);

    // 检查是否在特殊UP主列表中
    for (let i = 0; i < config.specialUps.length; i++) {
      const element = config.specialUps[i];
      if (element.up === upName) {
        specialInfo = element
        specialInfo.isSpecial = true;
        break;
      } else {
        specialInfo.isSpecial = false;
      }
    }
    log(specialInfo.isSpecial ? `UP主 ${upName} 在特殊列表中` : `UP主 ${upName} 不在特殊列表中`);

    return specialInfo;
  }


  // 查找并点击字幕按钮
  function setSubtitles(enable) {
    if (enable) {
      log('字幕-开始查找字幕按钮...');

      // 尝试多种选择器，因为B站的DOM结构可能会变化
      const subtitleSelectors = [
        '.bpx-player-ctrl-subtitle-language-item-text',//人工查找结果
      ];

      let subtitleButtonAll = [];
      let subtitleButton;
      for (let selector of subtitleSelectors) {
        subtitleButtonAll = document.querySelectorAll(selector);
        for (let i = 0; i < subtitleButtonAll.length; i++) {
          if (subtitleButtonAll[i] && subtitleButtonAll[i].innerHTML == '中文') {
            log(`字幕-找到字幕按钮，使用选择器: ${selector}`);
            subtitleButton = subtitleButtonAll[i]
            break;
          }
        }
      }

      if (subtitleButton) {
        // 检查字幕是否已经开启
        const isActive = subtitleButton.classList.contains('bui-active') ||
          subtitleButton.getAttribute('aria-checked') === 'true' ||
          subtitleButton.getAttribute('data-active') === 'true' ||
          (subtitleButton.parentNode && subtitleButton.parentNode.classList.contains('active'));

        if (!isActive) {
          log('字幕-字幕未开启，尝试点击按钮...');
          subtitleButton.click();
          log('字幕-字幕按钮已点击');

          // 验证字幕是否成功开启
          setTimeout(() => {
            const isNowActive = subtitleButton.classList.contains('bui-active') ||
              subtitleButton.getAttribute('aria-checked') === 'true' ||
              subtitleButton.getAttribute('data-active') === 'true' ||
              (subtitleButton.parentNode && subtitleButton.parentNode.classList.contains('active'));

            if (isNowActive) {
              log('字幕-字幕已成功开启');
            } else {
              log('字幕-字幕开启可能失败，按钮状态未改变');
            }
          }, 500);
        } else {
          log('字幕-字幕已经开启，无需操作');
        }
        return true;
      } else {
        log('字幕-未找到字幕按钮');
        return false;
      }
    }
  }


  // 设置播放速度
  function setPlaybackRate(rate) {
    log(`速度-设置播放速度为 ${rate}x`);

    // 查找播放速度控制按钮
    const speedButton = document.querySelector('.bpx-player-ctrl-playbackrate');

    if (!speedButton) {
      log('速度-未找到播放速度控制按钮');
      return false;
    } else {
      log('速度-找到播放速度控制按钮');
    }

    // 点击速度按钮打开菜单
    speedButton.click();

    // 等待菜单出现并选择对应速度
    setTimeout(() => {
      const speedItems = document.querySelectorAll('.bpx-player-ctrl-playbackrate-menu-item');
      let targetItem = null;

      speedItems.forEach(item => {
        if (+item.dataset.value === +rate) {
          targetItem = item;
        }
      });

      if (targetItem) {
        targetItem.click();
        log(`速度-已设置播放速度为 ${rate}x`);
      } else {
        log(`速度-未找到 ${rate}x 速度选项`);
      }
    }, 300);

    return true;
  }

  // 设置自动连播
  function setAutoPlay(enable) {
    log(`连播-${enable ? '开启' : '关闭'} 自动连播`);

    // 查找自动连播开关
    const autoPlayButton = document.querySelector('.switch-btn') ||
      document.querySelector('.switch-block');

    if (!autoPlayButton) {
      log('连播-未找到自动连播控制');
      return false;
    }

    // 检查当前状态
    const isChecked = autoPlayButton.classList.contains('on');

    // 如果状态不匹配，则点击切换
    if (enable !== isChecked) {
      autoPlayButton.click();
      log(`连播-${enable ? '开启' : '关闭'} 自动连播成功`);
    } else {
      log(`连播-自动连播已处于${enable ? '开启' : '关闭'}状态`);
    }

    return true;
  }


  // 设置弹幕是否开启
  function setDm(enable) {
    log(`弹幕-${enable ? '开启' : '关闭'} 弹幕`);

    // 查找弹幕控制按钮
    const dmButton = document.querySelector('.bpx-player-dm-switch input')

    // 查找弹幕设置按钮
    const dmSettingButton = document.querySelector('.bpx-player-dm-setting')

    if (!dmButton) {
      log('弹幕-未找到弹幕控制按钮');
      return false;
    }

    // 检查当前弹幕状态,通过检查弹幕设置按钮是否被禁用来判断是否开启了弹幕
    const isDmActive = dmSettingButton.classList.contains('disabled') ? false : true;

    // 如果状态不匹配，则点击切换
    if (enable === isDmActive) {
      log(`弹幕-弹幕已处于${enable ? '开启' : '关闭'}状态`);
    } else {
      dmButton.click();
      log(`弹幕-${enable ? '开启' : '关闭'} 弹幕成功`);
    }

    return true;
  }


  // 根据UP主设置特殊播放选项
  function setSpecialPlaybackOptions() {
    const specialInfo = isSpecialUp();

    if (specialInfo.isSpecial) {
      // 根据用户配置来改变播放设置
      setDm(specialInfo.dm);
      setSubtitles(specialInfo.subtitle);
      setPlaybackRate(specialInfo.rate);
      setAutoPlay(specialInfo.autoPlay);
    } else {
      // 对其他UP主设置正常速度,关闭自动连播,关闭自动连播,开启弹幕
      setDm(true);
      setSubtitles(false);
      setPlaybackRate(1.0);
      setAutoPlay(false);
    }
  }


  // 监听URL变化（B站使用SPA，页面切换时URL会变但不会刷新）
  let lastUrl = location.href;
  function checkUrlChange() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      log('检测到URL变化，重新尝试开启脚本');
      setTimeout(setSpecialPlaybackOptions, 1500);
    }
  }

  // 初始化
  function init() {
    log('脚本已加载，开始检测B站视频页面');

    // 初始尝试
    setTimeout(setSpecialPlaybackOptions, 1500);

    // 监听URL变化
    setInterval(checkUrlChange, 1000);

    // 监听页面可见性变化（用户切换标签页后返回）
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) {
        log('页面变为可见，重新检查播放设置');
        setTimeout(setSpecialPlaybackOptions, 1000);
      }
    });

    // 监听DOM变化，以应对动态加载的播放器
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'childList') {
          for (let node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // 检查是否添加了播放控制相关元素
              if (node.classList &&
                (node.classList.contains('bpx-player-ctrl-playbackrate') ||
                  node.classList.contains('bpx-player-ctrl-autoplay') ||
                  node.querySelector('.bpx-player-ctrl-playbackrate') ||
                  node.classList.contains('bpx-player-ctrl-subtitle') ||
                  node.querySelector('.bpx-player-ctrl-autoplay') ||
                  node.querySelector('.bpx-player-ctrl-subtitle'))) {
                log('检测到播放控制元素添加，尝试设置特殊播放选项');
                setTimeout(setSpecialPlaybackOptions, 500);
              }
            }
          }
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();