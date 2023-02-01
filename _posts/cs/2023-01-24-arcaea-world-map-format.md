---
title: Arcaea World Map Format
key: arcaea_world_map_format
tags: Arcaea
modify_date: "2023-01-24 22:37:00"
aside:
    toc: true
---

> 貌似网上能搜到一篇讲解，不管了，把之前写的整理一下扔出来  
> Client Version: 4.1.9

## Overview

目前还是用着JSON文件直接读取的办法，以后的事以后再说（

<!--more-->

{% highlight JSON linenos %}
{
    "map_id": "test",  // Unique name of the map
    "is_legacy": false,  // Legacy style map
    "is_beyond": false,  // Beyond challenge style map
    "beyond_health": 200,  // The total percentage of a beyond map
    "character_affinity": [],  // e.g. [0, 1]
    "affinity_multiplier": [],  // e.g. [1.5, 2.0]
    "chapter": 0,
    "available_from": -1,
    "available_to": 2106124800000,
    "is_repeatable": true,  // Repeatable map
    "require_id": "",
    "require_type": "",
    "require_value": 0,
    "require_localunlock_songid": "",
    "require_localunlock_challengeid": "",
    "coordinate": "0,0",  // Location coordinates in the chapter
    "step_count": 12,  // Total steps (unused)
    "custom_bg": "",  // Background picture
    "stamina_cost": 2,  // Stamina cost per time
    "curr_position": 0,  // (unused)
    "curr_capture": 0,  // (unused)
    "is_locked": false,  // (unused)
    "steps": [{
        "position": 0,  // Step position, starting from 0, must be continuous
        "capture": 10  // Progress required to crawl a step
    }, {
        "position": 1,
        "capture": 20,
        "items": [{
            "type": "fragment",
            "amount": 1000
        }]
    }, {
        "position": 2,
        "capture": 10,
        "restrict_id": "base",
        "restrict_type": "pack_id"
    }, {
        "position": 3,
        "capture": 10,
        "restrict_id": "base",
        "restrict_type": "pack_id",
        "step_type": ["randomsong"]
    }, {
        "position": 4,
        "capture": 10,
        "items": [{
            "type": "core",
            "id": "core_generic",
            "amount": 1
        }]
    }, {
        "position": 5,
        "capture": 10,
        "step_type": ["speedlimit"],
        "speed_limit_value": 20
    }, {
        "position": 6,
        "capture": 10
    }, {
        "position": 7,
        "capture": 10,
        "step_type": ["plusstamina"],
        "plus_stamina_value": 2
    }, {
        "position": 8,
        "capture": 10
    }, {
        "position": 9,
        "capture": 10,
        "items": [{
            "type": "fragment",
            "amount": 125
        }]
    }, {
        "position": 10,
        "capture": 10000,
        "step_type": ["plusstamina","speedlimit"],
        "plus_stamina_value": 2,
        "speed_limit_value": 5,
        "restrict_id": "fractureray",
        "restrict_type": "song_id",
        "restrict_difficulty" : 2
    }, {
        "position": 11,
        "capture": 0,
        "items": [{
            "type": "core",
            "id": "core_crimson",
            "amount": 500
        }, {
            "type": "fragment",
            "amount": 125
        },{
            "type": "character",
            "id": "2"
        }
        ]
    }]
}
{% endhighlight %}

## Details

The following is in Chinese, and I'm too lazy to translate.

> `list`: `array`, `dict`: `object`, `int`&`float`: `number`, `str`: `string`

### Chapter

`chapter: int`是章节ID，0是event章节，1是第一章，后面以此类推，特别有1001是beyond章节

### Character Affinity

搭档契合，`character_affinity: list[int]`和`affinity_multiplier: list[float]`是一一对应的，前者是搭档列表，后者是对应搭档的进度倍数列表

### Available Time

限时地图，一般出现在event章节中，请注意`available_from: int`和`available_to: int`都是毫秒时间戳，应当有13位

### Map Require

- `require_type: str`只能其中一个：`pack`, `character`, `single`, `fragment`, `chart_unlock`, `chapter_step`
- `require_id: str | list[str]`可以是list！解锁条件只显示第一个未解锁的，且`require_type`相同（目前只见过`chart_unlock`）
- `chart_unlock`似乎只在beyond图中生效，普通图会无曲绘，注意此时`require_id`是`song_id + difficulty`
- 当类型为`character`时，请注意`require_id`一定是字符串，也就是说如果是搭档，就会出现`'require_id': '2'`的情况
- 当类型为`chapter_step`和`fragment`时，`require_id`被忽略，需要`require_value: int`作为数值
- `require_localunlock_songid: str`是隐藏式本地歌曲解锁，会出现"???"的提示（目前只见过`fractureray`和`grievouslady`）
- `require_localunlock_challengeid: str`是隐藏式本地挑战解锁，会出现"???"的提示（目前只见过`singularity`, `tempestissimo`, `testify`）
- 其实还有个`requires: list[dict]`，但目前并无作用

### Step Items

- `items: list[dict]`，请注意最后一格需要有奖励，而且一般来说`capture`为0
- 对于每一个item，`type: str`和`id: str`是必须的，`amount: int`是可选的，即物品数量
- 请注意`id`一定是字符串，也就是说如果是搭档，就会出现`'id': '2'`的情况
- item都有啥，不是此文重点，懒得说了……

### Step Type

- `step_type: list[str]`是台阶类型，可以同时是多种类型，可选值有：`plusstamina`, `randomsong`, `speedlimit`
- 当类型中有`plusstamina`时，即为体力格，`plus_stamina_value: int`就是增加的体力值
- 当类型中有`speedlimit`时，即为限速格，`speed_limit_value: int`就是最大允许速度值，是游戏中实际速度值的10倍
- 当类型中有`randomsong`时，即为随机格，必须有下面的Step Restrict来限制随机范围

### Step Restrict

- `restrict_type: str`是前提，没有这项将不会有限制，只有两个可选值：`song_id`和`pack_id`
- `restrict_ids: list[str]`优先于`restrict_id: str`，有前者则后者失效，前者是多个值的列表，后者是单个值
- `restrict_difficulty: int`是可选的，只能是0, 1, 2, 3的其中一个
