# 🚀 Home Automation Control Hub Deployment Guide

এই অ্যাপ্লিকেশনটি গিটহাবে (GitHub) সঠিকভাবে আপলোড ও কোনো প্রকার ব্ল্যাঙ্ক স্ক্রিন বা হোয়াইট পেজ (White Screen) ছাড়া লাইভ হোস্ট করার জন্য নিচের ধাপগুলো অনুসরণ করুন।

---

## 🇧🇩 বাংলায় নির্দেশনা (Bengali Instructions)

### সমস্যা ১: গিটহাবে শুধুমাত্র "README.md" ফাইল দেখা যাচ্ছে, অন্য কোনো ফাইল নেই
আপনি যখন গিটহাবে নতুন রিপোজিটরি তৈরি করেছিলেন, তখন হয়তো "Add a README file" অপশনে টিক দিয়েছিলেন। এর ফলে শুধুমাত্র ঐ একটি ফাইলই গিটহাবে জমা হয়েছিল। আপনার ডাউনলোড করা ZIP ফাইলের সবগুলো কোড আপলোড করতে নিচের নিয়ম ফলো করুন:

1. **ZIP ফাইলটি এক্সট্রাক্ট করুন:** প্রথমে আপনার ডাউনলোড করা জিপ ফাইলটি এক্সট্রাক্ট (Extract/Unzip) করে আপনার কম্পিউটারের একটি ফোল্ডারে রাখুন।
2. **গিটহাবে আপলোড করুন:**
   - আপনার গিটহাব রিপোজিটরি পেজে যান।
   - ডানদিকের উপরে **Add file** এ ক্লিক করে **Upload files** সিলেক্ট করুন।
   - এবার আপনার কম্পিউটারে আনজিপ করা ফোল্ডারের মধ্যকার **সবগুলো ফাইল ও ফোল্ডার** (যেমন: `src/`, `.github/`, `index.html`, `package.json`, `vite.config.ts`) ড্র্যাগ করে ব্রাউজারে ছেড়ে দিন (Drag and Drop)।
   - আপলোড শেষ হলে নিচের **Commit changes** বাটনে ক্লিক করে সেভ করুন।

---

### समस्या ২: জিপ ফাইল আপলোডের পর লিংকে ক্লিক করলে শুধু সাদা বা ব্ল্যাঙ্ক পেজ (White Page) দেখায়
Vite এবং React দিয়ে তৈরি এই আধুনিক অ্যাপ্লিকেশনটি সরাসরি ব্রাউজারে চালানো যায় না, প্রথমে বিল্ড (Build) করে নিতে হয়। আপনি যদি গিটহাবের ডিফল্ট অপশন দিয়ে বিল্ড ছাড়া লাইভ করতে যান তবে ব্রাউজার `.tsx` ফাইল রিড করতে পারে না এবং সাদা উইন্ডো দেখায়। এটি ঠিক করতে গিটহাব অ্যাকশনস (GitHub Actions) চালু করুন:

1. আপনার গিটহাব রিপোজিটরির **Settings** ট্যাবে যান।
2. বামদিকের মেনুবার থেকে **Pages** অপশনে ক্লিক করুন।
3. **Build and deployment** সেকশনের নিচে **Source** ড্রপডাউনটি দেখতে পাবেন।
4. ড্রপডাউন মেনুটি **Deploy from a branch** থেকে পরিবর্তন করে **GitHub Actions** সিলেক্ট করে দিন।
5. ব্যস, আর কিছু করতে হবে না! এরপর গিটহাবের উপরের **Actions** ট্যাবে গেলে দেখতে পাবেন আপনার অ্যাপটি স্বয়ংক্রিয়ভাবে বিল্ড হচ্ছে এবং কয়েক মিনিটের মধ্যে একটি নতুন লাইভ লিংক তৈরি হয়ে যাবে যা শতভাগ কাজ করবে কোনো হোয়াইট পেজ ছাড়াই!

---

## 🇺🇸 English Instructions

### Step 1: Solving "Only README.md is visible on GitHub"
If you set up your GitHub repository with an auto-generated README, that will be the only file present. You need to upload your local project files:

1. **Extract ZIP:** First, extract/unzip the downloaded ZIP file to any folder on your computer.
2. **Manual Upload on GitHub:**
   - Go to your GitHub repository in your browser.
   - Click on the **Add file** dropdown button near the top-right and select **Upload files**.
   - Select and drag all files and directories from your extracted folder (including `src/`, `.github/`, `index.html`, `package.json`, `vite.config.ts`, `.gitignore`, etc.) into the upload box.
   - Wait for completion, fill out a commit description, and click **Commit changes**.

---

### Step 2: Fixing the Blank White Screen on GitHub Pages
Vite/React apps use modern JSX compilation. Standard GitHub branch deployments fail to parse typescript `.tsx` files directly, which results in a blank screen. To run compiling automatically via GitHub Actions:

1. Go to the **Settings** tab of your repository on GitHub.
2. Under the left-side panel, click on **Pages**.
3. Under the **Build and deployment** section, look at the **Source** dropdown option.
4. Change the selection from **Deploy from a branch** to **GitHub Actions**.
5. Go to the **Actions** tab at the top. You'll see automatic compilation and deployment taking place! Once completed, you'll get a fully functioning live URL with no blank screen.

---

## 🛠️ Security & Local Storage (স্থানীয় সিকিউরিটি গেট)
আপনার হোম অটোমেশনের সিকিউরিটি বজায় রাখার জন্য সমস্ত ক্রেডেনশিয়াল (ইমেইল ও পাসওয়ার্ড) সম্পূর্ণ নিরাপদভাবে শুধুমাত্র আপনার ব্যক্তিগত ব্রাউজারের `localStorage`-এ সংরক্ষিত থাকে। গিটহাবে হোস্ট করলেও আপনার কোড বা ডেটাবেস ডিটেলস অন্য কারো নিকট ফাঁস হওয়ার কোনো সুযোগ নেই। ড্যাশবোর্ডে প্রথমবার প্রবেশের সময় লগইন গেটে আপনার ফায়ারবেস অথেনটিকেশন ইমেইল ও পাসওয়ার্ড প্রদান করে প্রবেশ করতে হবে।
