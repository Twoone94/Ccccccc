import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.backgroundShadow}>
      <div className={styles.header}>
        <p className={styles.text}>全局设置</p>
        <div className={styles.container}>
          <img src="../image/mi3bfk9i-citd42t.svg" className={styles.icon} />
        </div>
      </div>
      <div className={styles.container19}>
        <div className={styles.nav}>
          <p className={styles.text2}>基础设置</p>
          <div className={styles.linkMargin}>
            <div className={styles.link}>
              <p className={styles.text3}>官方API</p>
            </div>
          </div>
          <p className={styles.text4}>第三方API</p>
          <p className={styles.text4}>TTS</p>
          <p className={styles.text4}>翻译</p>
          <p className={styles.text4}>快键键</p>
        </div>
        <div className={styles.main}>
          <div className={styles.container17}>
            <div className={styles.section}>
              <div className={styles.horizontalBorder}>
                <p className={styles.openAi}>OpenAI</p>
                <p className={styles.kimi}>Kimi</p>
                <p className={styles.deepSeek}>DeepSeek</p>
                <div className={styles.buttonMargin}>
                  <div className={styles.button}>
                    <p className={styles.gemini}>Gemini</p>
                  </div>
                </div>
              </div>
              <div className={styles.container3}>
                <p className={styles.text}>API 密钥</p>
                <div className={styles.container2}>
                  <img
                    src="../image/mi3bfk9i-avsa1xl.svg"
                    className={styles.icon2}
                  />
                </div>
              </div>
              <div className={styles.backgroundBorder}>
                <p className={styles.a}>************************</p>
                <div className={styles.button2}>
                  <div className={styles.container4}>
                    <img
                      src="../image/mi3bfk9i-9py729t.svg"
                      className={styles.icon2}
                    />
                  </div>
                  <p className={styles.text5}>隐藏key</p>
                </div>
                <div className={styles.button3}>
                  <p className={styles.text6}>检测</p>
                </div>
              </div>
              <div className={styles.container5}>
                <p className={styles.text7}>点击这里获取密钥</p>
                <p className={styles.text8}>多个密钥使用逗号或空格分隔</p>
              </div>
            </div>
            <div className={styles.section2}>
              <div className={styles.container6}>
                <p className={styles.text}>API 地址</p>
                <div className={styles.container2}>
                  <img
                    src="../image/mi3bfk9i-avsa1xl.svg"
                    className={styles.icon2}
                  />
                </div>
              </div>
              <div className={styles.backgroundBorder2}>
                <p className={styles.a}>
                  https://generativelanguage.googleapis.com
                </p>
                <div className={styles.container7}>
                  <img
                    src="../image/mi3bfk9i-8dd5b8p.svg"
                    className={styles.icon2}
                  />
                </div>
              </div>
            </div>
            <div className={styles.section3}>
              <div className={styles.container10}>
                <div className={styles.container8}>
                  <p className={styles.text}>模型</p>
                  <div className={styles.background}>
                    <p className={styles.a1}>1</p>
                  </div>
                  <div className={styles.container2}>
                    <img
                      src="../image/mi3bfk9i-e9l7auy.svg"
                      className={styles.icon2}
                    />
                  </div>
                  <div className={styles.container2}>
                    <img
                      src="../image/mi3bfk9i-7hd2ue7.svg"
                      className={styles.icon2}
                    />
                  </div>
                </div>
                <div className={styles.container9}>
                  <div className={styles.container2}>
                    <img
                      src="../image/mi3bfk9i-4rt8yb3.svg"
                      className={styles.icon2}
                    />
                  </div>
                  <div className={styles.container2}>
                    <img
                      src="../image/mi3bfk9i-46lmccu.svg"
                      className={styles.icon2}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.backgroundBorder3}>
                <div className={styles.horizontalBorder2}>
                  <div className={styles.container12}>
                    <div className={styles.container11}>
                      <img
                        src="../image/mi3bfk9i-syweo28.svg"
                        className={styles.icon}
                      />
                    </div>
                    <p className={styles.text6}>gemini-2.5</p>
                  </div>
                  <div className={styles.icon3}>
                    <div className={styles.vector} />
                  </div>
                </div>
                <div className={styles.container15}>
                  <p className={styles.gemini25Pro}>gemini-2.5-pro</p>
                  <div className={styles.container14}>
                    <div className={styles.container13}>
                      <img
                        src="../image/mi3bfk9j-u1l999q.svg"
                        className={styles.icon}
                      />
                    </div>
                    <div className={styles.container13}>
                      <img
                        src="../image/mi3bfk9j-hi6i71d.svg"
                        className={styles.icon}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.container16}>
                <p className={styles.text8}>查看&nbsp;</p>
                <p className={styles.text9}>Gemini 文档</p>
                <p className={styles.text8}>&nbsp;和&nbsp;</p>
                <p className={styles.text9}>模型</p>
                <p className={styles.text8}>&nbsp;获取更多详情</p>
              </div>
            </div>
          </div>
          <div className={styles.footerMargin}>
            <div className={styles.container18}>
              <div className={styles.button4}>
                <div className={styles.container4}>
                  <img
                    src="../image/mi3bfk9j-yk4c4xe.svg"
                    className={styles.icon2}
                  />
                </div>
                <p className={styles.text10}>管理</p>
              </div>
              <div className={styles.button5}>
                <div className={styles.container4}>
                  <img
                    src="../image/mi3bfk9j-pnpou98.svg"
                    className={styles.icon2}
                  />
                </div>
                <p className={styles.text11}>添加</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
