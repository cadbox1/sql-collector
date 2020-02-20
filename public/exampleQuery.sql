SET @userId = 26531;
SET @clientId = 4;

select 

l.`id` as lesson_id, 
lv.`name` 
-- tag filter
, count(lvt.`tag_id`) as tag_match_count 

from `lesson` l

inner join `lesson_version` lv on l.`CURRENT_VERSION_ID` = lv.`id`
and lv.`ACTIVE` = true
and lv.`PUBLISHED` = 65

-- tag filter
left join `lesson_version_tag` lvt on lvt.`lesson_version_id` = lv.`id` and lvt.`TAG_ID` in (1576)

-- category filter
inner join `category_nesting` cn on cn.`child_category_id` = l.`CATEGORY_ID` and cn.`ancestor_category_id` = 874

where l.`in_library` = true

-- authorisations
and l.`client_id` = @clientId
and (l.`AVAILABLE_TO_EVERYONE` is true or exists (

	select ltu.`user_id` as user_id, ltu.`lesson_id` as lesson_id
	from `library_target_user` ltu
	where ltu.`user_id` = @userId
	and ltu.`lesson_id` = l.`id`
	)
	
	or exists (
	
	select gu.`user_id` as user_id, ltg.`lesson_id` as lesson_id
	from `library_target_group` ltg
	inner join `org_group` g on g.`id` = ltg.`group_id` and g.`active` = true
	inner join `group_nesting` gn on gn.`ancestor_group_id` = g.`id`
	inner join `group_user` gu on gu.`group_id` = gn.`CHILD_GROUP_ID`
	where gu.`user_id` = @userId
	and ltg.`lesson_id` = l.`id`
	
))

/* and exists (
	select * 
	from `lesson_schedule` ls
	where ls.`LESSON_COMPLETED_DATE` is not null
	and ls.`user_id` = @userId
	and ls.`lesson_id` = l.`id`
) */

-- search query
-- and lv.`name` like "%test%"

-- add to get immediate results - e.g the lessons to return, not for dependent queries. category_id is null for root level. 
-- remove when using a search query so we can search in all categories.
-- and l.`category_id` = 575

group by l.`id`

-- tag filter
-- having `tag_match_count` = 1
;