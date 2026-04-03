#![deny(clippy::all)]

use napi::bindgen_prelude::*;
use napi_derive::napi; // 直接导入具体的宏
use trash::delete_all;
use trash::os_limited::{list, purge_all, restore_all};

#[napi(object)]
pub struct TrashItemNode {
    pub id: String,
    pub name: String,
    pub original_parent: String,
    pub time_deleted: f64, // not i64, use f64 for JS number compatibility (timestamps)
}

#[napi]
pub fn move_to_trash(paths: Vec<String>) -> Result<()> {
    delete_all(&paths).map_err(|e| Error::from_reason(e.to_string()))?;
    Ok(())
}

#[napi]
pub fn list_trash() -> Result<Vec<TrashItemNode>> {
    let items = list().map_err(|e| Error::from_reason(e.to_string()))?;
    Ok(items
        .into_iter()
        .map(|item| TrashItemNode {
            id: item.id.clone().into_string().unwrap_or_default(),
            name: item.name.clone(),
            original_parent: item.original_parent.to_string_lossy().into_owned(),
            time_deleted: item.time_deleted as f64,
        })
        .collect())
}

#[napi]
pub fn list_workspace_trash(path_prefix: String) -> Result<Vec<TrashItemNode>> {
    let items = list().map_err(|e| Error::from_reason(e.to_string()))?;
    let path_with_slash = format!("{}/", path_prefix);

    Ok(items
        .into_iter()
        .filter_map(|item| {
            let parent = item.original_parent.to_string_lossy().into_owned();
            let full_path = format!("{}/{}", parent, item.name);

            if parent == path_prefix
                || parent.starts_with(&path_with_slash)
                || full_path == path_prefix
            {
                Some(TrashItemNode {
                    id: item.id.clone().into_string().unwrap_or_default(),
                    name: item.name.clone(),
                    original_parent: parent,
                    time_deleted: item.time_deleted as f64,
                })
            } else {
                None
            }
        })
        .collect())
}

#[napi]
pub fn restore_trash_items(ids: Vec<String>) -> Result<()> {
    let items = list().map_err(|e| Error::from_reason(e.to_string()))?;
    let to_restore: Vec<_> = items
        .into_iter()
        .filter(|i| ids.contains(&i.id.clone().into_string().unwrap_or_default()))
        .collect();
    restore_all(to_restore).map_err(|e| Error::from_reason(e.to_string()))?;
    Ok(())
}

#[napi]
pub fn empty_trash() -> Result<()> {
    let items = list().map_err(|e| Error::from_reason(e.to_string()))?;
    purge_all(items).map_err(|e| Error::from_reason(e.to_string()))?;
    Ok(())
}

#[napi]
pub fn purge_trash_items(ids: Vec<String>) -> Result<()> {
    let items = list().map_err(|e| Error::from_reason(e.to_string()))?;
    let to_purge: Vec<_> = items
        .into_iter()
        .filter(|i| ids.contains(&i.id.clone().into_string().unwrap_or_default()))
        .collect();
    purge_all(to_purge).map_err(|e| Error::from_reason(e.to_string()))?;
    Ok(())
}
